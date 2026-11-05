package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Responsible;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.TeamTournamentRegistration;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.ResponsibleRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.TeamTournamentRegistrationRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

  @Mock
  private TeamRepository teamRepository;

  @Mock
  private ResponsibleRepository responsibleRepository;

  @Mock
  private MemberRepository memberRepository;

  @Mock
  private CurrentMemberResolver currentMemberResolver;

  @Mock
  private TeamTournamentRegistrationRepository teamTournamentRegistrationRepository;

  @InjectMocks
  private TeamService teamService;

  @Test
  void findAllTeamDtos_IncludesRegisteredTournamentNames() {
    Member captain = buildMember(1L, "captain", Member.Role.RESPONSIBLE);
    Team team = buildTeam(10L, captain);

    TeamTournamentRegistration firstRegistration = new TeamTournamentRegistration();
    firstRegistration.setTeam(team);
    firstRegistration.setTournament(buildTournament("Spring Battle Series 2026"));

    TeamTournamentRegistration secondRegistration = new TeamTournamentRegistration();
    secondRegistration.setTeam(team);
    secondRegistration.setTournament(buildTournament("Vinci Easter Cup 2026"));

    when(teamRepository.findAll()).thenReturn(List.of(team));
    when(teamTournamentRegistrationRepository.findAllByOrderByTournamentStartDateAsc())
        .thenReturn(List.of(firstRegistration, secondRegistration));

    List<be.vinci.ipl.cae.demo.models.dtos.TeamDto> result = teamService.findAllTeamDtos();

    assertEquals(1, result.size());
    assertEquals(
        List.of("Spring Battle Series 2026", "Vinci Easter Cup 2026"),
        result.getFirst().registeredTournamentNames());
  }

  @Test
  void assignSecondResponsible_ValidNomination_AssignsNewSecondResponsible() {
    Member current = buildMember(1L, "captain", Member.Role.RESPONSIBLE);
    Team team = buildTeam(10L, current);
    current.setTeam(team);

    Member target = buildMember(2L, "player2", Member.Role.MEMBER);
    target.setTeam(team);

    when(currentMemberResolver.resolve(current)).thenReturn(current);
    when(memberRepository.findById(2L)).thenReturn(Optional.of(target));
    when(responsibleRepository.save(any(Responsible.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(memberRepository.save(any(Member.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(teamRepository.save(any(Team.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Team updated = teamService.assignSecondResponsible(2L, current);

    assertNotNull(updated.getSecondResponsible());
    assertEquals(2L, updated.getSecondResponsible().getMember().getId());
    assertEquals(Member.Role.RESPONSIBLE, target.getRole());
    verify(memberRepository).save(target);
  }

  @Test
  void assignSecondResponsible_MainReplacesSecond_DemotesOldSecond() {
    Member currentMain = buildMember(1L, "captain", Member.Role.RESPONSIBLE);
    Team team = buildTeam(10L, currentMain);
    currentMain.setTeam(team);

    Member oldSecond = buildMember(3L, "old-second", Member.Role.RESPONSIBLE);
    oldSecond.setTeam(team);
    Responsible oldSecondResponsible = buildResponsible(103L, oldSecond);
    oldSecond.setResponsible(oldSecondResponsible);
    team.setSecondResponsible(oldSecondResponsible);

    Member newSecond = buildMember(2L, "new-second", Member.Role.MEMBER);
    newSecond.setTeam(team);
    Responsible newSecondResponsible = buildResponsible(102L, newSecond);
    newSecond.setResponsible(newSecondResponsible);

    when(currentMemberResolver.resolve(currentMain)).thenReturn(currentMain);
    when(memberRepository.findById(2L)).thenReturn(Optional.of(newSecond));
    when(memberRepository.save(any(Member.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(teamRepository.save(any(Team.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Team updated = teamService.assignSecondResponsible(2L, currentMain);

    assertEquals(1L, updated.getResponsible().getMember().getId());
    assertEquals(2L, updated.getSecondResponsible().getMember().getId());
    assertEquals(Member.Role.MEMBER, oldSecond.getRole());
    assertEquals(Member.Role.RESPONSIBLE, newSecond.getRole());
  }

  @Test
  void assignSecondResponsible_ExistingSecond_RotatesAllResponsibilities() {
    Member currentMain = buildMember(1L, "captain", Member.Role.RESPONSIBLE);
    Team team = buildTeam(10L, currentMain);
    currentMain.setTeam(team);

    Member currentSecondMember = buildMember(3L, "current-second", Member.Role.RESPONSIBLE);
    currentSecondMember.setTeam(team);
    Responsible currentSecondResponsible = buildResponsible(103L, currentSecondMember);
    currentSecondMember.setResponsible(currentSecondResponsible);
    team.setSecondResponsible(currentSecondResponsible);

    Member newSecond = buildMember(2L, "new-second", Member.Role.MEMBER);
    newSecond.setTeam(team);
    Responsible newSecondResponsible = buildResponsible(102L, newSecond);
    newSecond.setResponsible(newSecondResponsible);

    when(currentMemberResolver.resolve(currentSecondMember)).thenReturn(currentSecondMember);
    when(memberRepository.findById(2L)).thenReturn(Optional.of(newSecond));
    when(memberRepository.save(any(Member.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(teamRepository.save(any(Team.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Team updated = teamService.assignSecondResponsible(2L, currentSecondMember);

    assertEquals(3L, updated.getResponsible().getMember().getId());
    assertEquals(2L, updated.getSecondResponsible().getMember().getId());
    assertEquals(Member.Role.RESPONSIBLE, currentSecondMember.getRole());
    assertEquals(Member.Role.RESPONSIBLE, newSecond.getRole());
    assertEquals(Member.Role.MEMBER, currentMain.getRole());
  }

  @Test
  void assignSecondResponsible_CurrentMemberNotTeamResponsible_ThrowsException() {
    Member main = buildMember(1L, "captain", Member.Role.RESPONSIBLE);
    Team team = buildTeam(10L, main);

    Member regularMember = buildMember(2L, "member", Member.Role.MEMBER);
    regularMember.setTeam(team);

    when(currentMemberResolver.resolve(regularMember)).thenReturn(regularMember);

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> teamService.assignSecondResponsible(3L, regularMember));

    assertEquals(
        "Seul un responsable de l'équipe peut nommer un second responsable",
        exception.getMessage());
  }

  @Test
  void assignSecondResponsible_TargetIsMainResponsible_ThrowsException() {
    Member currentSecond = buildMember(2L, "second", Member.Role.RESPONSIBLE);
    Member main = buildMember(1L, "captain", Member.Role.RESPONSIBLE);
    Team team = buildTeam(10L, main);

    Responsible secondResponsible = buildResponsible(102L, currentSecond);
    currentSecond.setResponsible(secondResponsible);
    currentSecond.setTeam(team);
    team.setSecondResponsible(secondResponsible);

    when(currentMemberResolver.resolve(currentSecond)).thenReturn(currentSecond);
    when(memberRepository.findById(1L)).thenReturn(Optional.of(main));

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> teamService.assignSecondResponsible(1L, currentSecond));

    assertEquals(
        "Le responsable principal ne peut pas être nommé second responsable",
        exception.getMessage());
  }

  @Test
  void assignSecondResponsible_TargetOutsideTeam_ThrowsException() {
    Member current = buildMember(1L, "captain", Member.Role.RESPONSIBLE);
    Team team = buildTeam(10L, current);
    current.setTeam(team);

    Member target = buildMember(5L, "outside", Member.Role.MEMBER);
    Team otherTeam = buildTeam(20L, buildMember(8L, "other-captain", Member.Role.RESPONSIBLE));
    target.setTeam(otherTeam);

    when(currentMemberResolver.resolve(current)).thenReturn(current);
    when(memberRepository.findById(5L)).thenReturn(Optional.of(target));

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> teamService.assignSecondResponsible(5L, current));

    assertEquals("Le membre doit appartenir à votre équipe", exception.getMessage());
  }

  @Test
  void assignSecondResponsible_SelfNomination_ThrowsException() {
    Member current = buildMember(1L, "captain", Member.Role.RESPONSIBLE);
    Team team = buildTeam(10L, current);
    current.setTeam(team);

    when(currentMemberResolver.resolve(current)).thenReturn(current);

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> teamService.assignSecondResponsible(1L, current));

    assertEquals("Vous ne pouvez pas vous nommer vous-même", exception.getMessage());
  }

  private Member buildMember(Long id, String tag, Member.Role role) {
    Member member = new Member();
    member.setId(id);
    member.setTag(tag);
    member.setRole(role);
    return member;
  }

  private Team buildTeam(Long id, Member mainResponsibleMember) {
    Responsible mainResponsible = buildResponsible(100L + id, mainResponsibleMember);
    mainResponsibleMember.setResponsible(mainResponsible);
    Team team = new Team();
    team.setId(id);
    team.setNom("Team-" + id);
    team.setResponsible(mainResponsible);
    return team;
  }

  private Responsible buildResponsible(Long id, Member member) {
    Responsible responsible = new Responsible();
    responsible.setId(id);
    responsible.setMember(member);
    return responsible;
  }

  private be.vinci.ipl.cae.demo.models.entities.Tournament buildTournament(String name) {
    be.vinci.ipl.cae.demo.models.entities.Tournament tournament =
        new be.vinci.ipl.cae.demo.models.entities.Tournament();
    tournament.setName(name);
    return tournament;
  }
}
