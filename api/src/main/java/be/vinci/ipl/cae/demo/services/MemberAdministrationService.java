package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ForbiddenException;
import be.vinci.ipl.cae.demo.exceptions.NotFoundException;
import be.vinci.ipl.cae.demo.models.entities.Admin;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Member.Role;
import be.vinci.ipl.cae.demo.models.entities.Responsible;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.repositories.AdminRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.ResponsibleRepository;
import be.vinci.ipl.cae.demo.repositories.TeamJoinRequestRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentMatchRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service handling admin-only member management operations.
 */
@Service
public class MemberAdministrationService {

  private final MemberRepository memberRepository;
  private final AdminRepository adminRepository;
  private final ResponsibleRepository responsibleRepository;
  private final TeamRepository teamRepository;
  private final TeamJoinRequestRepository teamJoinRequestRepository;
  private final NotificationRepository notificationRepository;
  private final TournamentRepository tournamentRepository;
  private final TournamentMatchRepository tournamentMatchRepository;

  /**
   * Creates the admin operations service.
   *
   * @param memberRepository repository for members
   * @param adminRepository repository for admins
   * @param responsibleRepository repository for responsibles
   * @param teamRepository repository for teams
   * @param teamJoinRequestRepository repository for team join requests
   * @param notificationRepository repository for notifications
   * @param tournamentRepository repository for tournaments
   * @param tournamentMatchRepository repository for tournament matches
   */
  public MemberAdministrationService(
      MemberRepository memberRepository,
      AdminRepository adminRepository,
      ResponsibleRepository responsibleRepository,
      TeamRepository teamRepository,
      TeamJoinRequestRepository teamJoinRequestRepository,
      NotificationRepository notificationRepository,
      TournamentRepository tournamentRepository,
      TournamentMatchRepository tournamentMatchRepository) {
    this.memberRepository = memberRepository;
    this.adminRepository = adminRepository;
    this.responsibleRepository = responsibleRepository;
    this.teamRepository = teamRepository;
    this.teamJoinRequestRepository = teamJoinRequestRepository;
    this.notificationRepository = notificationRepository;
    this.tournamentRepository = tournamentRepository;
    this.tournamentMatchRepository = tournamentMatchRepository;
  }

  /**
   * Lists all admins.
   *
   * @param currentAdmin the currently authenticated admin
   * @return sorted list of admins
   */
  public List<Member> listAdmins(Member currentAdmin) {
    assertAdmin(currentAdmin);

    return memberRepository.findByRole(Role.ADMIN).stream()
        .sorted(
            Comparator.comparing(
                    Member::getTag,
                    String.CASE_INSENSITIVE_ORDER)
                .thenComparing(
                    Member::getEmail,
                    String.CASE_INSENSITIVE_ORDER))
        .toList();
  }

  /**
   * Promotes a member to admin role.
   *
   * @param targetEmail the member email to promote
   * @param currentAdmin the currently authenticated admin
   * @return the target member role after update
   */
  public Role promoteToAdmin(String targetEmail, Member currentAdmin) {
    assertAdmin(currentAdmin);

    String normalizedEmail = normalizeTargetEmail(targetEmail);
    Member target = memberRepository.findByEmail(normalizedEmail);
    if (target == null) {
      throw new NotFoundException("Membre non trouve");
    }

    if (target.getRole() == Role.ADMIN) {
      throw new ConflictException("Le membre est deja admin");
    }

    target.setRole(Role.ADMIN);
    memberRepository.save(target);

    Admin admin = target.getAdmin() != null ? target.getAdmin() : new Admin();
    admin.setId(target.getId());
    admin.setMember(target);
    adminRepository.save(admin);
    target.setAdmin(admin);
    memberRepository.save(target);
    return target.getRole();
  }

  /**
   * Removes admin role from a member with automatic fallback role.
   *
   * @param targetEmail the member email to demote
   * @param currentAdmin the currently authenticated admin
   * @return the target member role after update
   */
  public Role removeAdminRole(String targetEmail, Member currentAdmin) {
    assertAdmin(currentAdmin);

    String normalizedEmail = normalizeTargetEmail(targetEmail);
    Member target = memberRepository.findByEmail(normalizedEmail);
    if (target == null) {
      throw new NotFoundException("Membre non trouve");
    }

    if (target.getRole() != Role.ADMIN) {
      throw new ConflictException("Le membre n'est pas admin");
    }

    if (currentAdmin.getEmail() != null && currentAdmin.getEmail().equals(target.getEmail())) {
      throw new BadRequestException("Un admin ne peut pas retirer son propre statut admin");
    }

    if (target.getResponsible() != null) {
      target.setRole(Role.RESPONSIBLE);
    } else {
      target.setRole(Role.MEMBER);
    }

    if (target.getAdmin() != null) {
      reassignOwnedTournaments(target, currentAdmin);
      adminRepository.delete(target.getAdmin());
      target.setAdmin(null);
    }

    memberRepository.save(target);
    return target.getRole();
  }

  /**
   * Searches for members by email or tag (non-admin members only, excluding banned).
   *
   * @param query the search term (email or tag)
   * @param currentAdmin the currently authenticated admin
   * @return list of matching non-admin members
   */
  public List<Member> searchMembers(String query, Member currentAdmin) {
    assertAdmin(currentAdmin);

    if (query == null || query.isBlank()) {
      return List.of();
    }

    String searchTerm = query.trim().toLowerCase(Locale.ROOT);
    return ((List<Member>) memberRepository.findAll()).stream()
        .filter(member -> member.getRole() != Role.ADMIN)
        .filter(member -> !member.isBanned())
        .filter(member -> member.getEmail().toLowerCase(Locale.ROOT).contains(searchTerm)
            || member.getTag().toLowerCase(Locale.ROOT).contains(searchTerm))
        .sorted(
            Comparator.comparing(
                    Member::getTag,
                    String.CASE_INSENSITIVE_ORDER)
                .thenComparing(
                    Member::getEmail,
                    String.CASE_INSENSITIVE_ORDER))
        .toList();
  }

  /**
   * Bans a member from the platform by an admin.
   * The member is soft-deleted: data is preserved but the member cannot login
   * and their profile is hidden.
   *
   * @param targetId     the id of the member to ban
   * @param currentAdmin the authenticated admin performing the ban
   */
  @Transactional
  public void banMember(Long targetId, Member currentAdmin) {
    assertAdmin(currentAdmin);

    Member target = memberRepository.findById(targetId)
        .orElseThrow(() -> new NotFoundException("Membre introuvable"));

    if (target.getId().equals(currentAdmin.getId())) {
      throw new BadRequestException("Un admin ne peut pas se bannir lui-meme");
    }

    if (target.isBanned()) {
      throw new ConflictException("Ce membre est deja banni");
    }

    Team team = target.getTeam();
    final Responsible targetResponsible = target.getResponsible();

    // Handle team reassignment like before, but keep the member entity
    if (team != null) {
      List<Member> teamMembers = memberRepository.findByTeamId(team.getId());
      boolean isMainResponsible = team.getResponsible() != null
          && team.getResponsible().getMember() != null
          && team.getResponsible().getMember().getId().equals(target.getId());
      boolean isSecondResponsible = team.getSecondResponsible() != null
          && team.getSecondResponsible().getMember() != null
          && team.getSecondResponsible().getMember().getId().equals(target.getId());

      List<Member> remainingMembers = teamMembers.stream()
          .filter(member -> !member.getId().equals(target.getId()))
          .filter(member -> !member.isBanned())
          .toList();

      if (isSecondResponsible) {
        team.setSecondResponsible(null);
        teamRepository.save(team);
      } else if (isMainResponsible) {
        team.setResponsible(null);
        if (team.getSecondResponsible() != null) {
          Responsible secondResp = team.getSecondResponsible();
          team.setSecondResponsible(null);
          teamRepository.save(team);
          Member newMain = secondResp.getMember();
          if (newMain.getRole() != Role.ADMIN && !newMain.isBanned()) {
            newMain.setRole(Role.RESPONSIBLE);
          }
          team.setResponsible(secondResp);
          teamRepository.save(team);
          memberRepository.save(newMain);
        } else if (!remainingMembers.isEmpty()) {
          team.setSecondResponsible(null);
          teamRepository.save(team);
          Member newMain = remainingMembers.get(new Random().nextInt(remainingMembers.size()));
          Responsible newResp = ensureResponsible(newMain);
          if (newMain.getRole() != Role.ADMIN) {
            newMain.setRole(Role.RESPONSIBLE);
          }
          team.setResponsible(newResp);
          teamRepository.save(team);
          memberRepository.save(newMain);
        } else {
          team.setResponsible(null);
          team.setSecondResponsible(null);
          teamRepository.save(team);
        }
      }
    }

    // Soft delete: mark as banned instead of deleting
    target.setTeam(null);
    target.setBannedAt(java.time.LocalDateTime.now());

    // Remove admin role if present and reassign tournaments
    Admin targetAdmin = target.getAdmin();
    if (targetAdmin != null) {
      reassignOwnedTournaments(target, currentAdmin);
      target.setAdmin(null);
      adminRepository.delete(targetAdmin);
    }

    // Remove responsible role if present
    if (targetResponsible != null) {
      target.setResponsible(null);
      responsibleRepository.delete(targetResponsible);
    }

    // Delete join requests and notifications
    teamJoinRequestRepository.deleteAll(
        teamJoinRequestRepository.findByMemberId(target.getId()));
    notificationRepository.deleteAll(
        notificationRepository.findBySenderId(target.getId()));

    memberRepository.save(target);
  }

  /**
   * Unbans a previously banned member.
   *
   * @param targetId     the id of the member to unban
   * @param currentAdmin the authenticated admin performing the unban
   */
  @Transactional
  public void unbanMember(Long targetId, Member currentAdmin) {
    assertAdmin(currentAdmin);

    Member target = memberRepository.findById(targetId)
        .orElseThrow(() -> new NotFoundException("Membre introuvable"));

    if (!target.isBanned()) {
      throw new BadRequestException("Ce membre n'est pas banni");
    }

    target.setBannedAt(null);
    memberRepository.save(target);
  }

  private void assertAdmin(Member currentAdmin) {
    if (currentAdmin == null || currentAdmin.getRole() != Role.ADMIN) {
      throw new ForbiddenException("Action non autorisee");
    }
  }

  private String normalizeTargetEmail(String targetEmail) {
    if (targetEmail == null || targetEmail.isBlank()) {
      throw new BadRequestException("Email cible obligatoire");
    }
    return targetEmail.trim().toLowerCase(Locale.ROOT);
  }

  private Responsible ensureResponsible(Member member) {
    Responsible responsible = member.getResponsible();
    if (responsible == null) {
      responsible = new Responsible();
      responsible.setMember(member);
      member.setResponsible(responsible);
      responsibleRepository.save(responsible);
    }
    return responsible;
  }

  private void reassignOwnedTournaments(Member targetAdminMember, Member fallbackAdminMember) {
    Admin targetAdmin = targetAdminMember.getAdmin();
    if (targetAdmin == null) {
      return;
    }

    Admin fallbackAdmin = ensureAdminEntity(fallbackAdminMember);

    // Reassign tournaments
    List<Tournament> ownedTournaments =
        tournamentRepository.findByAdministratorId(targetAdmin.getId());
    if (!ownedTournaments.isEmpty()) {
      ownedTournaments.forEach(tournament -> tournament.setAdministrator(fallbackAdmin));
      tournamentRepository.saveAll(ownedTournaments);
    }

    // Reassign tournament matches
    List<be.vinci.ipl.cae.demo.models.entities.TournamentMatch> ownedMatches =
        tournamentMatchRepository.findByAdministratorId(targetAdmin.getId());
    if (!ownedMatches.isEmpty()) {
      ownedMatches.forEach(match -> match.setAdministrator(fallbackAdmin));
      tournamentMatchRepository.saveAll(ownedMatches);
    }
  }

  private Admin ensureAdminEntity(Member member) {
    Admin admin = member.getAdmin();
    if (admin != null) {
      return admin;
    }

    Admin createdAdmin = new Admin();
    createdAdmin.setId(member.getId());
    createdAdmin.setMember(member);
    adminRepository.save(createdAdmin);
    member.setAdmin(createdAdmin);
    member.setRole(Role.ADMIN);
    memberRepository.save(member);
    return createdAdmin;
  }
}
