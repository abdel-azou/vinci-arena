package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Responsible;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.TeamJoinRequest;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationTypeRepository;
import be.vinci.ipl.cae.demo.repositories.TeamJoinRequestRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TeamJoinRequestServiceTest {

  @Mock
  private TeamJoinRequestRepository joinRequestRepository;

  @Mock
  private TeamRepository teamRepository;

  @Mock
  private MemberRepository memberRepository;

  @Mock
  private CurrentMemberResolver currentMemberResolver;

  @Mock
  private NotificationRepository notificationRepository;

  @Mock
  private NotificationTypeRepository notificationTypeRepository;

  @Mock
  private TeamMembershipTransitionService teamMembershipTransitionService;

  @InjectMocks
  private TeamJoinRequestService teamJoinRequestService;

  @Test
  void createJoinRequest_TargetTeamWithoutPlayers_ThrowsException() {
    Long teamId = 10L;
    Member requester = new Member();
    requester.setId(1L);
    requester.setRole(Member.Role.MEMBER);

    Team emptyTeam = new Team();
    emptyTeam.setId(teamId);
    emptyTeam.setNom("EmptyTeam");

    when(currentMemberResolver.resolve(requester)).thenReturn(requester);
    when(joinRequestRepository.existsByMemberIdAndTeamIdAndStatus(
        requester.getId(),
        teamId,
        be.vinci.ipl.cae.demo.models.entities.JoinRequestStatus.PENDING)).thenReturn(false);
    when(teamRepository.findById(teamId)).thenReturn(Optional.of(emptyTeam));
    when(memberRepository.findByTeamId(teamId)).thenReturn(List.of());

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> teamJoinRequestService.createJoinRequest(teamId, requester));

    assertEquals(
        "Impossible d'envoyer une demande d'adhésion à une équipe sans joueur",
        exception.getMessage());
    verify(joinRequestRepository, never()).save(org.mockito.ArgumentMatchers.any());
  }

  @Test
  void createJoinRequest_ResponsibleMember_IsAllowed() {
    Long teamId = 10L;
    Member requester = new Member();
    requester.setId(1L);
    requester.setRole(Member.Role.RESPONSIBLE);

    Team targetTeam = new Team();
    targetTeam.setId(teamId);
    targetTeam.setNom("Target");

    Member targetMember = new Member();
    targetMember.setId(20L);

    TeamJoinRequest savedRequest = new TeamJoinRequest();
    savedRequest.setId(99L);

    when(currentMemberResolver.resolve(requester)).thenReturn(requester);
    when(joinRequestRepository.existsByMemberIdAndTeamIdAndStatus(
        requester.getId(),
        teamId,
        be.vinci.ipl.cae.demo.models.entities.JoinRequestStatus.PENDING)).thenReturn(false);
    when(teamRepository.findById(teamId)).thenReturn(Optional.of(targetTeam));
    when(memberRepository.findByTeamId(teamId)).thenReturn(List.of(targetMember));
    when(joinRequestRepository.save(org.mockito.ArgumentMatchers.any(TeamJoinRequest.class)))
        .thenReturn(savedRequest);

    TeamJoinRequest result = teamJoinRequestService.createJoinRequest(teamId, requester);

    assertEquals(99L, result.getId());
    verify(joinRequestRepository).save(org.mockito.ArgumentMatchers.any(TeamJoinRequest.class));
  }

  @Test
  void createJoinRequest_TargetTeamAlreadyHasSameTag_ThrowsException() {
    Long teamId = 10L;
    Member requester = new Member();
    requester.setId(1L);
    requester.setTag("sameTag");
    requester.setRole(Member.Role.MEMBER);

    Team targetTeam = new Team();
    targetTeam.setId(teamId);
    targetTeam.setNom("Target");

    when(currentMemberResolver.resolve(requester)).thenReturn(requester);
    when(joinRequestRepository.existsByMemberIdAndTeamIdAndStatus(
        requester.getId(),
        teamId,
        be.vinci.ipl.cae.demo.models.entities.JoinRequestStatus.PENDING)).thenReturn(false);
    when(teamRepository.findById(teamId)).thenReturn(Optional.of(targetTeam));
    when(memberRepository.existsByTagAndTeamIdAndIdNot(
        requester.getTag(),
        teamId,
        requester.getId())).thenReturn(true);

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> teamJoinRequestService.createJoinRequest(teamId, requester));

    assertEquals(
        "Impossible d'envoyer la demande : votre tag est déjà utilisé dans cette équipe",
        exception.getMessage());
    verify(memberRepository, never()).findByTeamId(teamId);
    verify(joinRequestRepository, never()).save(org.mockito.ArgumentMatchers.any());
  }

  @Test
  void acceptRequest_LastResponsibleMoves_KeepsOldTeamWithoutPlayers() {
    Member responsible = new Member();
    responsible.setId(1L);
    responsible.setTag("captain");
    responsible.setRole(Member.Role.RESPONSIBLE);
    Responsible responsibleEntity = new Responsible();
    responsibleEntity.setId(100L);
    responsibleEntity.setMember(responsible);
    responsible.setResponsible(responsibleEntity);

    Team oldTeam = new Team();
    oldTeam.setId(10L);
    oldTeam.setNom("OLD_TEAM");
    oldTeam.setResponsible(responsibleEntity);
    responsible.setTeam(oldTeam);

    Team targetTeam = new Team();
    targetTeam.setId(20L);
    targetTeam.setNom("NEW_TEAM");

    TeamJoinRequest request = new TeamJoinRequest();
    request.setId(55L);
    request.setMember(responsible);
    request.setTeam(targetTeam);
    request.setStatus(be.vinci.ipl.cae.demo.models.entities.JoinRequestStatus.PENDING);

    Responsible targetResponsible = new Responsible();
    Member targetCaptain = new Member();
    targetCaptain.setId(200L);
    targetResponsible.setMember(targetCaptain);
    targetTeam.setResponsible(targetResponsible);

    Member currentDecisionMaker = targetCaptain;

    when(joinRequestRepository.findById(55L)).thenReturn(Optional.of(request));
    when(currentMemberResolver.resolve(currentDecisionMaker)).thenReturn(currentDecisionMaker);
    when(memberRepository.existsByTagAndTeamIdAndIdNot(
        responsible.getTag(),
        targetTeam.getId(),
        responsible.getId())).thenReturn(false);
    when(joinRequestRepository.findByMemberIdAndStatus(
        responsible.getId(),
        be.vinci.ipl.cae.demo.models.entities.JoinRequestStatus.PENDING)).thenReturn(List.of(request));
    when(memberRepository.save(org.mockito.ArgumentMatchers.any(Member.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(joinRequestRepository.save(org.mockito.ArgumentMatchers.any(TeamJoinRequest.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    TeamJoinRequest result = teamJoinRequestService.acceptRequest(55L, currentDecisionMaker);

    assertEquals(be.vinci.ipl.cae.demo.models.entities.JoinRequestStatus.ACCEPTED, result.getStatus());
    assertEquals(targetTeam, responsible.getTeam());
    assertEquals(targetTeam, result.getMember().getTeam());
    verify(teamMembershipTransitionService).detachMemberFromCurrentTeam(responsible);
  }
}
