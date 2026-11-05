package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ForbiddenException;
import be.vinci.ipl.cae.demo.exceptions.NotFoundException;
import be.vinci.ipl.cae.demo.models.entities.JoinRequestStatus;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.TeamJoinRequest;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationTypeRepository;
import be.vinci.ipl.cae.demo.repositories.TeamJoinRequestRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing team join requests.
 */
@Service
@Transactional
public class TeamJoinRequestService {

  private final TeamJoinRequestRepository joinRequestRepository;
  private final TeamRepository teamRepository;
  private final MemberRepository memberRepository;
  private final CurrentMemberResolver currentMemberResolver;
  private final NotificationRepository notificationRepository;
  private final NotificationTypeRepository notificationTypeRepository;
  private final TeamMembershipTransitionService teamMembershipTransitionService;

  /**
   * Constructor.
   */
  public TeamJoinRequestService(
      TeamJoinRequestRepository joinRequestRepository,
      TeamRepository teamRepository,
      MemberRepository memberRepository,
      CurrentMemberResolver currentMemberResolver,
      NotificationRepository notificationRepository,
      NotificationTypeRepository notificationTypeRepository,
      TeamMembershipTransitionService teamMembershipTransitionService) {
    this.joinRequestRepository = joinRequestRepository;
    this.teamRepository = teamRepository;
    this.memberRepository = memberRepository;
    this.currentMemberResolver = currentMemberResolver;
    this.notificationRepository = notificationRepository;
    this.notificationTypeRepository = notificationTypeRepository;
    this.teamMembershipTransitionService = teamMembershipTransitionService;
  }

  /**
   * Creates a new join request for the current member and the given team.
   */
  public TeamJoinRequest createJoinRequest(Long teamId, Member currentMember) {
    Member member = currentMemberResolver.resolve(currentMember);
    if (member == null) {
      throw new IllegalArgumentException("Membre introuvable");
    }

    if (member.getTeam() != null
        && member.getTeam().getId() != null
        && member.getTeam().getId().equals(teamId)) {
      throw new ConflictException("Vous êtes déjà dans cette équipe");
    }

    boolean alreadyPending = joinRequestRepository.existsByMemberIdAndTeamIdAndStatus(
        member.getId(), teamId, JoinRequestStatus.PENDING);

    if (alreadyPending) {
      throw new ConflictException("Vous avez déjà une demande en attente pour cette équipe");
    }

    Team team = teamRepository.findById(teamId)
        .orElseThrow(() -> new NotFoundException("Équipe introuvable"));

    boolean duplicateTagInTargetTeam = memberRepository.existsByTagAndTeamIdAndIdNot(
        member.getTag(),
        team.getId(),
        member.getId());

    if (duplicateTagInTargetTeam) {
      throw new IllegalArgumentException(
          "Impossible d'envoyer la demande : votre tag est déjà utilisé dans cette équipe");
    }

    List<Member> teamMembers = memberRepository.findByTeamId(teamId);
    if (teamMembers.isEmpty()) {
      throw new IllegalArgumentException(
        "Impossible d'envoyer une demande d'adhésion à une équipe sans joueur");
    }

    TeamJoinRequest request = new TeamJoinRequest();
    request.setMember(member);
    request.setTeam(team);
    request.setStatus(JoinRequestStatus.PENDING);
    request.setCreatedAt(LocalDateTime.now());

    TeamJoinRequest savedRequest = joinRequestRepository.save(request);

    notifyResponsibles(team, member);

    return savedRequest;
  }

  private void notifyResponsibles(Team team, Member requester) {
    NotificationType type = notificationTypeRepository.findByName("Demande d'adhésion")
        .orElse(null);
    if (type == null) {
      return;
    }

    String message = requester.getTag() + " souhaite rejoindre votre équipe " + team.getNom();
    String link = "/team";

    if (team.getResponsible() != null && team.getResponsible().getMember() != null) {
      createNotificationFor(team.getResponsible().getMember(), message, link, type);
    }
    if (team.getSecondResponsible() != null
        && team.getSecondResponsible().getMember() != null) {
      createNotificationFor(team.getSecondResponsible().getMember(), message, link, type);
    }
  }

  private void createNotificationFor(Member recipient, String message, String link,
      NotificationType type) {
    Notification notification = new Notification();
    notification.setMessage(message);
    notification.setRedirectLink(link);
    notification.setSender(recipient);
    notification.setNotificationType(type);
    notificationRepository.save(notification);
  }

  /**
   * Returns all pending join requests for the team managed by the current responsible member.
   */
  public List<TeamJoinRequest> getPendingRequestsForMyTeam(Member currentMember) {
    Member member = currentMemberResolver.resolve(currentMember);
    if (member == null) {
      throw new IllegalArgumentException("Membre introuvable");
    }

    Team team = teamRepository.findByResponsibleMemberId(member.getId());
    if (team == null) {
      team = teamRepository.findBySecondResponsibleMemberId(member.getId());
    }

    if (team == null) {
      throw new ForbiddenException("Vous n'êtes responsable d'aucune équipe");
    }

    return joinRequestRepository.findByTeamIdAndStatusOrderByCreatedAtAsc(
        team.getId(),
        JoinRequestStatus.PENDING);
  }

  /**
   * Accepts a pending join request.
   * Assigns the member to the team and rejects other pending requests of that member.
   */
  public TeamJoinRequest acceptRequest(Long requestId, Member currentMember) {
    TeamJoinRequest request = getPendingRequestForDecision(requestId, currentMember);

    Member targetMember = request.getMember();
    Team targetTeam = request.getTeam();
    boolean duplicateTagInTargetTeam = memberRepository.existsByTagAndTeamIdAndIdNot(
        targetMember.getTag(),
        targetTeam.getId(),
        targetMember.getId());

    if (duplicateTagInTargetTeam) {
      throw new ConflictException("Un membre de cette équipe utilise déjà ce tag");
    }

    request.setStatus(JoinRequestStatus.ACCEPTED);
    request.setDecidedAt(LocalDateTime.now());
    joinRequestRepository.save(request);

    if (targetMember.getTeam() != null
        && targetMember.getTeam().getId() != null
        && !targetMember.getTeam().getId().equals(targetTeam.getId())) {
      teamMembershipTransitionService.detachMemberFromCurrentTeam(targetMember);
    }

    targetMember.setTeam(targetTeam);
    memberRepository.save(targetMember);

    List<TeamJoinRequest> otherPendingRequests =
        joinRequestRepository.findByMemberIdAndStatus(
            targetMember.getId(), JoinRequestStatus.PENDING);

    for (TeamJoinRequest pending : otherPendingRequests) {
      if (!pending.getId().equals(request.getId())) {
        pending.setStatus(JoinRequestStatus.REJECTED);
        pending.setDecidedAt(LocalDateTime.now());
        joinRequestRepository.save(pending);
      }
    }

    notifyMemberOfAcceptance(targetMember, targetTeam);

    return request;
  }

  private void notifyMemberOfAcceptance(Member member, Team team) {
    NotificationType type = notificationTypeRepository.findByName("Acceptation d'adhésion")
        .orElse(null);
    if (type == null) {
      return;
    }
    String message = "Votre demande d'adhésion à l'équipe " + team.getNom() + " a été acceptée !";
    createNotificationFor(member, message, "/team", type);
  }

  /**
   * Rejects a pending join request.
   */
  public TeamJoinRequest rejectRequest(Long requestId, Member currentMember, String reason) {
    TeamJoinRequest request = getPendingRequestForDecision(requestId, currentMember);

    request.setStatus(JoinRequestStatus.REJECTED);
    request.setDecidedAt(LocalDateTime.now());
    TeamJoinRequest saved = joinRequestRepository.save(request);

    notifyMemberOfRejection(request.getMember(), request.getTeam(), reason);

    return saved;
  }

  private void notifyMemberOfRejection(Member member, Team team, String reason) {
    NotificationType type = notificationTypeRepository.findByName("Refus d'adhésion")
        .orElse(null);
    if (type == null) {
      return;
    }

    String message = "Votre demande d'adhésion à l'équipe " + team.getNom()
        + " a été refusée. Raison : " + reason;
    createNotificationFor(member, message, null, type);
  }

  private TeamJoinRequest getPendingRequestForDecision(Long requestId, Member currentMember) {
    TeamJoinRequest request = joinRequestRepository.findById(requestId)
        .orElseThrow(() -> new NotFoundException("Demande introuvable"));

    ensureCurrentMemberCanManageRequest(request, currentMember);

    if (request.getStatus() != JoinRequestStatus.PENDING) {
      throw new BadRequestException("Cette demande n'est plus en attente");
    }

    return request;
  }

  /**
   * Ensures the current member is main or second responsible of the request team.
   */
  private void ensureCurrentMemberCanManageRequest(TeamJoinRequest request, Member currentMember) {
    Member member = currentMemberResolver.resolve(currentMember);
    if (member == null) {
      throw new IllegalArgumentException("Membre introuvable");
    }

    Team team = request.getTeam();
    Long currentId = member.getId();

    boolean isMainResponsible =
        team.getResponsible() != null
            && team.getResponsible().getMember() != null
            && currentId.equals(team.getResponsible().getMember().getId());

    boolean isSecondResponsible =
        team.getSecondResponsible() != null
            && team.getSecondResponsible().getMember() != null
            && currentId.equals(team.getSecondResponsible().getMember().getId());

    if (!isMainResponsible && !isSecondResponsible) {
      throw new ForbiddenException("Action non autorisée sur cette demande");
    }
  }

}
