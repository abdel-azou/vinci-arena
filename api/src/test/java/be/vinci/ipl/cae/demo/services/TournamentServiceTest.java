package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.dtos.CreateTournamentRequest;
import be.vinci.ipl.cae.demo.models.dtos.TournamentDto;
import be.vinci.ipl.cae.demo.models.dtos.TournamentMatchDto;
import be.vinci.ipl.cae.demo.models.entities.Admin;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Responsible;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.TeamTournamentRegistration;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentMatch;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import be.vinci.ipl.cae.demo.repositories.AdminRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.MemberUnavailabilityRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationTypeRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentMatchRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentMatchTeamSelectionRepository;
import be.vinci.ipl.cae.demo.repositories.TeamTournamentRegistrationRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for TournamentService.
 */
@ExtendWith(MockitoExtension.class)
class TournamentServiceTest {

  @Mock
  private TournamentRepository tournamentRepository;

  @Mock
  private AdminRepository adminRepository;

  @Mock
  private MemberRepository memberRepository;

  @Mock
  private TeamRepository teamRepository;

  @Mock
  private TeamTournamentRegistrationRepository teamTournamentRegistrationRepository;

  @Mock
  private TournamentMatchRepository tournamentMatchRepository;

    @Mock
    private TournamentMatchTeamSelectionRepository tournamentMatchTeamSelectionRepository;

    @Mock
    private MemberUnavailabilityRepository memberUnavailabilityRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationTypeRepository notificationTypeRepository;

  @Mock
  private CurrentMemberResolver currentMemberResolver;

  @InjectMocks
  private TournamentService tournamentService;

  @Test
  void createTournament_AsAdminWithValidDates_SavesTournament() {
    LocalDateTime startDate = LocalDateTime.now().plusDays(10);
    LocalDateTime endDate = startDate.plusDays(2);
    LocalDateTime deadline = LocalDateTime.now().plusDays(5);
    CreateTournamentRequest request = new CreateTournamentRequest(
        "Winter Clash",
        "Tournoi test",
        startDate,
        endDate,
        deadline,
        16
    );

    Member currentMember = new Member();
    currentMember.setId(1L);

    Member resolvedMember = new Member();
    resolvedMember.setId(1L);
    resolvedMember.setRole(Member.Role.ADMIN);

    Admin admin = new Admin();
    admin.setId(99L);
    resolvedMember.setAdmin(admin);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(tournamentRepository.save(any(Tournament.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    Tournament result = tournamentService.createTournament(request, currentMember);

    assertEquals("Winter Clash", result.getName());
    assertEquals("Tournoi test", result.getDescription());
    assertEquals(16, result.getMaxTeams());
    assertEquals(TournamentStatus.PREPARATION, result.getStatus());
    assertEquals(admin, result.getAdministrator());
    verify(tournamentRepository).save(any(Tournament.class));
  }

  @Test
  void createTournament_AsNonAdmin_ThrowsException() {
    CreateTournamentRequest request = new CreateTournamentRequest(
        "Winter Clash",
        "Tournoi test",
        LocalDateTime.of(2026, 4, 10, 18, 0),
        LocalDateTime.of(2026, 4, 12, 20, 0),
        LocalDateTime.of(2026, 4, 8, 23, 59),
        16
    );

    Member currentMember = new Member();
    currentMember.setId(1L);

    Member resolvedMember = new Member();
    resolvedMember.setId(1L);
    resolvedMember.setRole(Member.Role.MEMBER);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> tournamentService.createTournament(request, currentMember));

    assertEquals("Seul un admin peut créer un tournoi", exception.getMessage());
    verify(tournamentRepository, never()).save(any(Tournament.class));
  }

  @Test
  void createTournament_WithDuplicateName_ThrowsException() {
    CreateTournamentRequest request = new CreateTournamentRequest(
        "Winter Clash",
        "Tournoi test",
        LocalDateTime.now().plusDays(10),
        LocalDateTime.now().plusDays(12),
        LocalDateTime.now().plusDays(5),
        16
    );

    Member currentMember = new Member();
    currentMember.setId(1L);

    Member resolvedMember = new Member();
    resolvedMember.setId(1L);
    resolvedMember.setRole(Member.Role.ADMIN);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(tournamentRepository.existsByName("Winter Clash")).thenReturn(true);

    RuntimeException exception = assertThrows(
        RuntimeException.class,
        () -> tournamentService.createTournament(request, currentMember));

    assertEquals(
        "Un tournoi avec ce nom existe déjà. Choisis un autre nom.",
        exception.getMessage());
    verify(tournamentRepository, never()).save(any(Tournament.class));
  }

  @Test
  void createTournament_WithPastStartDate_ThrowsException() {
    LocalDateTime now = LocalDateTime.now();
    CreateTournamentRequest request = new CreateTournamentRequest(
        "Winter Clash",
        "Tournoi test",
        now.minusDays(1),
        now.plusDays(1),
        now.minusDays(2),
        16
    );

    Member currentMember = new Member();
    currentMember.setId(1L);

    Member resolvedMember = new Member();
    resolvedMember.setId(1L);
    resolvedMember.setRole(Member.Role.ADMIN);

    Admin admin = new Admin();
    admin.setId(99L);
    resolvedMember.setAdmin(admin);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> tournamentService.createTournament(request, currentMember));

    assertEquals("La date limite d'inscription ne peut pas être dans le passé",
        exception.getMessage());
    verify(tournamentRepository, never()).save(any(Tournament.class));
  }

  @Test
  void createTournament_AdminWithoutAdminEntity_CreatesAdminEntity() {
    LocalDateTime now = LocalDateTime.now().plusDays(1);
    CreateTournamentRequest request = new CreateTournamentRequest(
        "Spring Clash",
        "Tournoi test",
        now.plusDays(2),
        now.plusDays(4),
        now.plusDays(1),
        8
    );

    Member currentMember = new Member();
    currentMember.setId(5L);

    Member resolvedMember = new Member();
    resolvedMember.setId(5L);
    resolvedMember.setRole(Member.Role.ADMIN);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(adminRepository.save(any(Admin.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(tournamentRepository.save(any(Tournament.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    Tournament result = tournamentService.createTournament(request, currentMember);

    assertEquals(5L, result.getAdministrator().getId());
    verify(adminRepository).save(any(Admin.class));
    verify(tournamentRepository).save(any(Tournament.class));
  }

  @Test
  void getMyDraftTournamentDtos_AsAdmin_ReturnsDrafts() {
    Member currentMember = new Member();
    currentMember.setId(9L);

    Member resolvedMember = new Member();
    resolvedMember.setId(9L);
    resolvedMember.setRole(Member.Role.ADMIN);

    Admin admin = new Admin();
    admin.setId(9L);

    Tournament draft = new Tournament();
    draft.setId(31L);
    draft.setName("Draft Cup");
    draft.setDescription("Brouillon test");
    draft.setStartDate(LocalDateTime.of(2026, 4, 10, 18, 0));
    draft.setEndDate(LocalDateTime.of(2026, 4, 12, 20, 0));
    draft.setRegistrationDeadline(LocalDateTime.of(2026, 4, 8, 23, 59));
    draft.setMaxTeams(16);
    draft.setStatus(TournamentStatus.PREPARATION);
    draft.setAdministrator(admin);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(tournamentRepository.findByStatusOrderByStartDateAsc(
        TournamentStatus.PREPARATION)).thenReturn(java.util.List.of(draft));
    when(teamTournamentRegistrationRepository.findByTournamentIdOrderByRegistrationDateAsc(31L))
        .thenReturn(java.util.List.of());

    java.util.List<TournamentDto> drafts = tournamentService.getMyDraftTournamentDtos(
        currentMember);

    assertEquals(1, drafts.size());
    assertEquals("Draft Cup", drafts.getFirst().name());
  }

  @Test
  void updateDraftTournament_AsAdmin_UpdatesDraft() {
    CreateTournamentRequest request = new CreateTournamentRequest(
        "Draft Cup Updated",
        "Description modifiée",
        LocalDateTime.of(2026, 5, 10, 18, 0),
        LocalDateTime.of(2026, 5, 12, 20, 0),
        LocalDateTime.of(2026, 5, 8, 23, 59),
        24
    );

    Member currentMember = new Member();
    currentMember.setId(9L);

    Member resolvedMember = new Member();
    resolvedMember.setId(9L);
    resolvedMember.setRole(Member.Role.ADMIN);

    Admin admin = new Admin();
    admin.setId(9L);

    Tournament draft = new Tournament();
    draft.setId(31L);
    draft.setStatus(TournamentStatus.PREPARATION);
    draft.setAdministrator(admin);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(tournamentRepository.findById(31L)).thenReturn(java.util.Optional.of(draft));
    when(tournamentRepository.save(any(Tournament.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    Tournament updated = tournamentService.updateDraftTournament(31L, request, currentMember);

    assertEquals("Draft Cup Updated", updated.getName());
    assertEquals(24, updated.getMaxTeams());
    assertEquals(TournamentStatus.PREPARATION, updated.getStatus());
  }

  @Test
  void updateDraftTournament_WithDuplicateName_ThrowsException() {
    CreateTournamentRequest request = new CreateTournamentRequest(
        "Existing Cup",
        "Description modifiée",
        LocalDateTime.of(2026, 5, 10, 18, 0),
        LocalDateTime.of(2026, 5, 12, 20, 0),
        LocalDateTime.of(2026, 5, 8, 23, 59),
        24
    );

    Member currentMember = new Member();
    currentMember.setId(9L);

    Member resolvedMember = new Member();
    resolvedMember.setId(9L);
    resolvedMember.setRole(Member.Role.ADMIN);

    Tournament draft = new Tournament();
    draft.setId(31L);
    draft.setStatus(TournamentStatus.PREPARATION);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(tournamentRepository.findById(31L)).thenReturn(java.util.Optional.of(draft));
    when(tournamentRepository.existsByNameAndIdNot("Existing Cup", 31L)).thenReturn(true);

    RuntimeException exception = assertThrows(
        RuntimeException.class,
        () -> tournamentService.updateDraftTournament(31L, request, currentMember));

    assertEquals(
        "Un tournoi avec ce nom existe déjà. Choisis un autre nom.",
        exception.getMessage());
    verify(tournamentRepository, never()).save(any(Tournament.class));
  }

  @Test
  void publishDraftTournament_AsAdmin_PublishesDraft() {
    Member currentMember = new Member();
    currentMember.setId(9L);

    Member resolvedMember = new Member();
    resolvedMember.setId(9L);
    resolvedMember.setRole(Member.Role.ADMIN);

    Admin admin = new Admin();
    admin.setId(9L);

    Tournament draft = new Tournament();
    draft.setId(32L);
    draft.setName("Draft Cup");
    draft.setStartDate(LocalDateTime.now().plusDays(2));
    draft.setEndDate(LocalDateTime.now().plusDays(3));
    draft.setRegistrationDeadline(LocalDateTime.now().plusDays(1));
    draft.setStatus(TournamentStatus.PREPARATION);
    draft.setAdministrator(admin);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(tournamentRepository.findById(32L)).thenReturn(java.util.Optional.of(draft));
    when(tournamentRepository.save(any(Tournament.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    Tournament published = tournamentService.publishDraftTournament(32L, currentMember);

    assertEquals(TournamentStatus.INSCRIPTION, published.getStatus());
  }

  @Test
  void publishDraftTournament_AsAnotherAdmin_PublishesDraft() {
    Member currentMember = new Member();
    currentMember.setId(9L);

    Member resolvedMember = new Member();
    resolvedMember.setId(9L);
    resolvedMember.setRole(Member.Role.ADMIN);

    Admin ownerAdmin = new Admin();
    ownerAdmin.setId(123L);

    Tournament draft = new Tournament();
    draft.setId(320L);
    draft.setName("Shared Draft");
    draft.setStartDate(LocalDateTime.now().plusDays(5));
    draft.setEndDate(LocalDateTime.now().plusDays(6));
    draft.setRegistrationDeadline(LocalDateTime.now().plusDays(3));
    draft.setStatus(TournamentStatus.PREPARATION);
    draft.setAdministrator(ownerAdmin);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(tournamentRepository.findById(320L)).thenReturn(java.util.Optional.of(draft));
    when(tournamentRepository.save(any(Tournament.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    Tournament published = tournamentService.publishDraftTournament(320L, currentMember);

    assertEquals(TournamentStatus.INSCRIPTION, published.getStatus());
    verify(tournamentRepository).save(any(Tournament.class));
  }

  @Test
  void registerMyTeamToTournament_AsMainResponsible_SavesRegistration() {
    Member currentMember = new Member();
    currentMember.setId(1L);

    Team team = new Team();
    team.setId(10L);

    Member resolvedMember = new Member();
    resolvedMember.setId(1L);
    resolvedMember.setTeam(team);

    Member mainResponsibleMember = new Member();
    mainResponsibleMember.setId(1L);
    Responsible mainResponsible = new Responsible();
    mainResponsible.setMember(mainResponsibleMember);
    team.setResponsible(mainResponsible);

    Tournament tournament = new Tournament();
    tournament.setId(20L);
    tournament.setRegistrationDeadline(LocalDateTime.now().plusHours(6));
    tournament.setStartDate(LocalDateTime.now().plusDays(1));
    tournament.setEndDate(LocalDateTime.now().plusDays(2));
    tournament.setMaxTeams(16);
    tournament.setStatus(TournamentStatus.INSCRIPTION);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(memberRepository.countByTeamId(10L)).thenReturn(4L);
    when(tournamentRepository.findById(20L)).thenReturn(java.util.Optional.of(tournament));
    when(teamTournamentRegistrationRepository.existsByTeamIdAndTournamentId(10L, 20L))
        .thenReturn(false);
    when(teamTournamentRegistrationRepository.findByTournamentIdOrderByRegistrationDateAsc(20L))
        .thenReturn(java.util.List.of());
    when(teamTournamentRegistrationRepository.save(any(TeamTournamentRegistration.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    TeamTournamentRegistration result = tournamentService.registerMyTeamToTournament(
        20L,
        currentMember);

    assertEquals(team, result.getTeam());
    assertEquals(tournament, result.getTournament());
    verify(teamTournamentRegistrationRepository).save(any(TeamTournamentRegistration.class));
  }

  @Test
  void registerMyTeamToTournament_AsSecondResponsible_SavesRegistration() {
    Member currentMember = new Member();
    currentMember.setId(2L);

    Team team = new Team();
    team.setId(11L);

    Member resolvedMember = new Member();
    resolvedMember.setId(2L);
    resolvedMember.setTeam(team);

    Member secondResponsibleMember = new Member();
    secondResponsibleMember.setId(2L);
    Responsible secondResponsible = new Responsible();
    secondResponsible.setMember(secondResponsibleMember);
    team.setSecondResponsible(secondResponsible);

    Tournament tournament = new Tournament();
    tournament.setId(21L);
    tournament.setRegistrationDeadline(LocalDateTime.now().plusHours(6));
    tournament.setStartDate(LocalDateTime.now().plusDays(1));
    tournament.setEndDate(LocalDateTime.now().plusDays(2));
    tournament.setMaxTeams(16);
    tournament.setStatus(TournamentStatus.INSCRIPTION);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(memberRepository.countByTeamId(11L)).thenReturn(4L);
    when(tournamentRepository.findById(21L)).thenReturn(java.util.Optional.of(tournament));
    when(teamTournamentRegistrationRepository.existsByTeamIdAndTournamentId(11L, 21L))
        .thenReturn(false);
    when(teamTournamentRegistrationRepository.findByTournamentIdOrderByRegistrationDateAsc(21L))
        .thenReturn(java.util.List.of());
    when(teamTournamentRegistrationRepository.save(any(TeamTournamentRegistration.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    TeamTournamentRegistration result = tournamentService.registerMyTeamToTournament(
        21L,
        currentMember);

    assertEquals(team, result.getTeam());
    assertEquals(tournament, result.getTournament());
    verify(teamTournamentRegistrationRepository).save(any(TeamTournamentRegistration.class));
  }

  @Test
  void registerMyTeamToTournament_AsRegularMember_ThrowsException() {
    Member currentMember = new Member();
    currentMember.setId(3L);

    Team team = new Team();
    team.setId(12L);

    Member resolvedMember = new Member();
    resolvedMember.setId(3L);
    resolvedMember.setTeam(team);

    Member otherResponsibleMember = new Member();
    otherResponsibleMember.setId(99L);
    Responsible mainResponsible = new Responsible();
    mainResponsible.setMember(otherResponsibleMember);
    team.setResponsible(mainResponsible);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> tournamentService.registerMyTeamToTournament(22L, currentMember));

    assertEquals("Seuls les responsables de l'équipe peuvent l'inscrire", exception.getMessage());
    verify(teamTournamentRegistrationRepository, never())
        .save(any(TeamTournamentRegistration.class));
  }

  @Test
  void registerMyTeamToTournament_WhenTournamentNotFound_ThrowsException() {
    Member currentMember = new Member();
    currentMember.setId(4L);

    Team team = new Team();
    team.setId(13L);

    Member resolvedMember = new Member();
    resolvedMember.setId(4L);
    resolvedMember.setTeam(team);

    Member mainResponsibleMember = new Member();
    mainResponsibleMember.setId(4L);
    Responsible mainResponsible = new Responsible();
    mainResponsible.setMember(mainResponsibleMember);
    team.setResponsible(mainResponsible);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(memberRepository.countByTeamId(13L)).thenReturn(4L);
    when(tournamentRepository.findById(99L)).thenReturn(java.util.Optional.empty());

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> tournamentService.registerMyTeamToTournament(99L, currentMember));

    assertEquals("Tournoi introuvable", exception.getMessage());
    verify(teamTournamentRegistrationRepository, never())
        .save(any(TeamTournamentRegistration.class));
  }

  @Test
  void registerMyTeamToTournament_WhenTournamentIsNotPublished_ThrowsException() {
    Member currentMember = new Member();
    currentMember.setId(5L);

    Team team = new Team();
    team.setId(14L);

    Member resolvedMember = new Member();
    resolvedMember.setId(5L);
    resolvedMember.setTeam(team);

    Member mainResponsibleMember = new Member();
    mainResponsibleMember.setId(5L);
    Responsible mainResponsible = new Responsible();
    mainResponsible.setMember(mainResponsibleMember);
    team.setResponsible(mainResponsible);

    Tournament tournament = new Tournament();
    tournament.setId(25L);
    tournament.setRegistrationDeadline(LocalDateTime.now().plusHours(6));
    tournament.setStartDate(LocalDateTime.now().plusDays(1));
    tournament.setEndDate(LocalDateTime.now().plusDays(2));
    tournament.setMaxTeams(16);
    tournament.setStatus(TournamentStatus.PREPARATION);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(memberRepository.countByTeamId(14L)).thenReturn(4L);
    when(tournamentRepository.findById(25L)).thenReturn(java.util.Optional.of(tournament));

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> tournamentService.registerMyTeamToTournament(25L, currentMember));

    assertEquals("Les inscriptions ne sont pas ouvertes pour l'instant",
        exception.getMessage());
    verify(teamTournamentRegistrationRepository, never())
        .save(any(TeamTournamentRegistration.class));
  }

  @Test
  void registerMyTeamToTournament_WhenRegistrationDeadlineIsPassed_ThrowsException() {
    Member currentMember = new Member();
    currentMember.setId(6L);

    Team team = new Team();
    team.setId(15L);

    Member resolvedMember = new Member();
    resolvedMember.setId(6L);
    resolvedMember.setTeam(team);

    Member mainResponsibleMember = new Member();
    mainResponsibleMember.setId(6L);
    Responsible mainResponsible = new Responsible();
    mainResponsible.setMember(mainResponsibleMember);
    team.setResponsible(mainResponsible);

    Tournament tournament = new Tournament();
    tournament.setId(26L);
    tournament.setRegistrationDeadline(LocalDateTime.now().minusMinutes(1));
    tournament.setStartDate(LocalDateTime.now().plusDays(1));
    tournament.setEndDate(LocalDateTime.now().plusDays(1));
    tournament.setMaxTeams(16);
    tournament.setStatus(TournamentStatus.INSCRIPTION);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(memberRepository.countByTeamId(15L)).thenReturn(4L);
    when(tournamentRepository.findById(26L)).thenReturn(java.util.Optional.of(tournament));

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> tournamentService.registerMyTeamToTournament(26L, currentMember));

    assertEquals("Les inscriptions sont closes pour ce tournoi",
        exception.getMessage());
    verify(teamTournamentRegistrationRepository, never())
        .save(any(TeamTournamentRegistration.class));
  }

  @Test
  void registerMyTeamToTournament_WhenTeamIsAlreadyRegistered_ThrowsException() {
    Member currentMember = new Member();
    currentMember.setId(7L);

    Team team = new Team();
    team.setId(16L);

    Member resolvedMember = new Member();
    resolvedMember.setId(7L);
    resolvedMember.setTeam(team);

    Member mainResponsibleMember = new Member();
    mainResponsibleMember.setId(7L);
    Responsible mainResponsible = new Responsible();
    mainResponsible.setMember(mainResponsibleMember);
    team.setResponsible(mainResponsible);

    Tournament tournament = new Tournament();
    tournament.setId(27L);
    tournament.setRegistrationDeadline(LocalDateTime.now().plusHours(6));
    tournament.setStartDate(LocalDateTime.now().plusDays(1));
    tournament.setEndDate(LocalDateTime.now().plusDays(2));
    tournament.setMaxTeams(16);
    tournament.setStatus(TournamentStatus.INSCRIPTION);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(memberRepository.countByTeamId(16L)).thenReturn(4L);
    when(tournamentRepository.findById(27L)).thenReturn(java.util.Optional.of(tournament));
    when(teamTournamentRegistrationRepository.existsByTeamIdAndTournamentId(16L, 27L))
        .thenReturn(true);

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> tournamentService.registerMyTeamToTournament(27L, currentMember));

    assertEquals("Votre équipe est déjà inscrite à ce tournoi", exception.getMessage());
    verify(teamTournamentRegistrationRepository, never())
        .save(any(TeamTournamentRegistration.class));
  }

  @Test
  void registerMyTeamToTournament_WhenTournamentIsFull_ThrowsException() {
    Member currentMember = new Member();
    currentMember.setId(8L);

    Team team = new Team();
    team.setId(17L);

    Member resolvedMember = new Member();
    resolvedMember.setId(8L);
    resolvedMember.setTeam(team);

    Member mainResponsibleMember = new Member();
    mainResponsibleMember.setId(8L);
    Responsible mainResponsible = new Responsible();
    mainResponsible.setMember(mainResponsibleMember);
    team.setResponsible(mainResponsible);

    Tournament tournament = new Tournament();
    tournament.setId(28L);
    tournament.setRegistrationDeadline(LocalDateTime.now().plusHours(6));
    tournament.setStartDate(LocalDateTime.now().plusDays(1));
    tournament.setEndDate(LocalDateTime.now().plusDays(2));
    tournament.setMaxTeams(2);
    tournament.setStatus(TournamentStatus.INSCRIPTION);

    TeamTournamentRegistration firstRegistration = new TeamTournamentRegistration();
    Team firstTeam = new Team();
    firstTeam.setNom("Alpha");
    firstRegistration.setTeam(firstTeam);

    TeamTournamentRegistration secondRegistration = new TeamTournamentRegistration();
    Team secondTeam = new Team();
    secondTeam.setNom("Beta");
    secondRegistration.setTeam(secondTeam);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(memberRepository.countByTeamId(17L)).thenReturn(4L);
    when(tournamentRepository.findById(28L)).thenReturn(java.util.Optional.of(tournament));
    when(teamTournamentRegistrationRepository.existsByTeamIdAndTournamentId(17L, 28L))
        .thenReturn(false);
    when(teamTournamentRegistrationRepository.findByTournamentIdOrderByRegistrationDateAsc(28L))
        .thenReturn(java.util.List.of(firstRegistration, secondRegistration));

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> tournamentService.registerMyTeamToTournament(28L, currentMember));

    assertEquals("Le nombre maximum d'équipes pour ce tournoi est atteint",
        exception.getMessage());
    verify(teamTournamentRegistrationRepository, never())
        .save(any(TeamTournamentRegistration.class));
  }

  @Test
  void registerMyTeamToTournament_WhenTeamHasLessThanFourMembers_ThrowsException() {
    Member currentMember = new Member();
    currentMember.setId(18L);

    Team team = new Team();
    team.setId(18L);

    Member resolvedMember = new Member();
    resolvedMember.setId(18L);
    resolvedMember.setTeam(team);

    Member mainResponsibleMember = new Member();
    mainResponsibleMember.setId(18L);
    Responsible mainResponsible = new Responsible();
    mainResponsible.setMember(mainResponsibleMember);
    team.setResponsible(mainResponsible);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(memberRepository.countByTeamId(18L)).thenReturn(3L);

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> tournamentService.registerMyTeamToTournament(29L, currentMember));

    assertEquals(
        "Une équipe doit compter au moins 4 membres pour s'inscrire à un tournoi",
        exception.getMessage());
    verify(teamTournamentRegistrationRepository, never())
        .save(any(TeamTournamentRegistration.class));
  }

  @Test
  void generateTournamentMatches_AsAdminAfterDeadline_CreatesMatchesWithByes() {
    Member currentMember = new Member();
    currentMember.setId(50L);

    Member resolvedMember = new Member();
    resolvedMember.setId(50L);
    resolvedMember.setRole(Member.Role.ADMIN);
    Admin admin = new Admin();
    admin.setId(50L);
    resolvedMember.setAdmin(admin);

    Tournament tournament = new Tournament();
    tournament.setId(80L);
    tournament.setStatus(TournamentStatus.INSCRIPTION);
    tournament.setRegistrationDeadline(LocalDateTime.now().minusDays(1));
    tournament.setStartDate(LocalDateTime.now().plusDays(2));
    tournament.setEndDate(LocalDateTime.now().plusDays(4));

    Team teamA = new Team();
    teamA.setId(1L);
    Team teamB = new Team();
    teamB.setId(2L);
    Team teamC = new Team();
    teamC.setId(3L);

    TeamTournamentRegistration regA = new TeamTournamentRegistration();
    regA.setTeam(teamA);
    TeamTournamentRegistration regB = new TeamTournamentRegistration();
    regB.setTeam(teamB);
    TeamTournamentRegistration regC = new TeamTournamentRegistration();
    regC.setTeam(teamC);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(tournamentRepository.findById(80L)).thenReturn(java.util.Optional.of(tournament));
    when(teamTournamentRegistrationRepository.findByTournamentIdOrderByRegistrationDateAsc(80L))
        .thenReturn(List.of(regA, regB, regC));
    when(tournamentMatchRepository.findByTournamentIdOrderByScheduledDateAsc(80L))
        .thenReturn(List.of());
    when(tournamentRepository.findByStatusOrderByStartDateAsc(TournamentStatus.TERMINE))
        .thenReturn(List.of());
    when(tournamentMatchRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

    List<TournamentMatchDto> results =
        tournamentService.generateTournamentMatches(80L, currentMember);

    assertEquals(3, results.size());
    assertTrue(results.stream().allMatch(match -> match.scheduledDate() != null));
    assertEquals(1, results.stream().filter(TournamentMatchDto::isBye).count());
    assertTrue(results.stream().anyMatch(match -> "FINAL".equals(match.round())));
    long distinctDays = results.stream()
        .map(TournamentMatchDto::scheduledDate)
        .filter(Objects::nonNull)
        .map(LocalDateTime::toLocalDate)
        .distinct()
        .count();
    assertEquals(2, distinctDays);
    verify(tournamentMatchRepository).deleteByTournamentId(80L);
    verify(tournamentMatchRepository).saveAll(any());
  }

  @Test
  void generateTournamentMatches_SingleTeam_DeclaresWinner() {
    Member currentMember = new Member();
    currentMember.setId(52L);

    Member resolvedMember = new Member();
    resolvedMember.setId(52L);
    resolvedMember.setRole(Member.Role.ADMIN);
    Admin admin = new Admin();
    admin.setId(52L);
    resolvedMember.setAdmin(admin);

    Tournament tournament = new Tournament();
    tournament.setId(82L);
    tournament.setStatus(TournamentStatus.INSCRIPTION);
    tournament.setRegistrationDeadline(LocalDateTime.now().minusDays(1));
    tournament.setStartDate(LocalDateTime.now().plusDays(2));
    tournament.setEndDate(LocalDateTime.now().plusDays(4));

    Team teamA = new Team();
    teamA.setId(1L);
    teamA.setNom("TEAM_ALPHA");

    TeamTournamentRegistration regA = new TeamTournamentRegistration();
    regA.setTeam(teamA);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(tournamentRepository.findById(82L)).thenReturn(java.util.Optional.of(tournament));
    when(teamTournamentRegistrationRepository.findByTournamentIdOrderByRegistrationDateAsc(82L))
        .thenReturn(List.of(regA));
    when(tournamentMatchRepository.findByTournamentIdOrderByScheduledDateAsc(82L))
        .thenReturn(List.of());

    List<TournamentMatchDto> results =
        tournamentService.generateTournamentMatches(82L, currentMember);

    assertTrue(results.isEmpty());
    assertEquals("TEAM_ALPHA", tournament.getWinnerTeamName());
    assertEquals(TournamentStatus.TERMINE, tournament.getStatus());
    verify(tournamentMatchRepository).deleteByTournamentId(82L);
    verify(tournamentRepository).save(tournament);
    verify(tournamentMatchRepository, never()).saveAll(any());
  }

  @Test
  void generateTournamentMatches_BeforeDeadline_ThrowsException() {
    Member currentMember = new Member();
    currentMember.setId(51L);

    Member resolvedMember = new Member();
    resolvedMember.setId(51L);
    resolvedMember.setRole(Member.Role.ADMIN);
    Admin admin = new Admin();
    admin.setId(51L);
    resolvedMember.setAdmin(admin);

    Tournament tournament = new Tournament();
    tournament.setId(81L);
    tournament.setStatus(TournamentStatus.INSCRIPTION);
    tournament.setRegistrationDeadline(LocalDateTime.now().plusHours(2));
    tournament.setStartDate(LocalDateTime.now().plusDays(1));
    tournament.setEndDate(LocalDateTime.now().plusDays(2));

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(tournamentRepository.findById(81L)).thenReturn(java.util.Optional.of(tournament));

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> tournamentService.generateTournamentMatches(81L, currentMember));

    assertEquals(
        "La génération n'est possible qu'après la date limite d'inscription",
        exception.getMessage());
  }

  @Test
  void generateTournamentMatches_WhenTournamentPeriodTooShort_ThrowsException() {
    Member currentMember = new Member();
    currentMember.setId(60L);

    Member resolvedMember = new Member();
    resolvedMember.setId(60L);
    resolvedMember.setRole(Member.Role.ADMIN);
    Admin admin = new Admin();
    admin.setId(60L);
    resolvedMember.setAdmin(admin);

    LocalDateTime startDate = LocalDateTime.now().plusDays(1).withSecond(0).withNano(0);
    Tournament tournament = new Tournament();
    tournament.setId(90L);
    tournament.setStatus(TournamentStatus.INSCRIPTION);
    tournament.setRegistrationDeadline(LocalDateTime.now().minusDays(1));
    tournament.setStartDate(startDate);
    tournament.setEndDate(startDate);

    Team teamA = new Team();
    teamA.setId(1L);
    Team teamB = new Team();
    teamB.setId(2L);
    Team teamC = new Team();
    teamC.setId(3L);

    TeamTournamentRegistration regA = new TeamTournamentRegistration();
    regA.setTeam(teamA);
    TeamTournamentRegistration regB = new TeamTournamentRegistration();
    regB.setTeam(teamB);
    TeamTournamentRegistration regC = new TeamTournamentRegistration();
    regC.setTeam(teamC);

    when(currentMemberResolver.resolve(currentMember)).thenReturn(resolvedMember);
    when(tournamentRepository.findById(90L)).thenReturn(java.util.Optional.of(tournament));
    when(tournamentMatchRepository.findByTournamentIdOrderByScheduledDateAsc(90L))
        .thenReturn(List.of());
    when(teamTournamentRegistrationRepository.findByTournamentIdOrderByRegistrationDateAsc(90L))
        .thenReturn(List.of(regA, regB, regC));
    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> tournamentService.generateTournamentMatches(90L, currentMember));

    assertNotNull(exception.getMessage());
    assertTrue(exception.getMessage().contains("pas assez de jours disponibles"));
    verify(tournamentMatchRepository, never()).saveAll(any());
  }
}
