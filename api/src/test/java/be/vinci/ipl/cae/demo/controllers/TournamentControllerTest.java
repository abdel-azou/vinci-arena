package be.vinci.ipl.cae.demo.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import be.vinci.ipl.cae.demo.exceptions.ForbiddenException;
import be.vinci.ipl.cae.demo.exceptions.NotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.TournamentDto;
import be.vinci.ipl.cae.demo.models.entities.Admin;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.TeamTournamentRegistration;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import be.vinci.ipl.cae.demo.services.MemberService;
import be.vinci.ipl.cae.demo.services.TournamentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TournamentController.class)
@Import(TournamentControllerTest.TestSecurityConfig.class)
class TournamentControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private TournamentService tournamentService;

  @MockBean
  private MemberService memberService;

  @Test
  void createTournament_ValidRequestAsAdmin_ReturnsCreatedTournament() throws Exception {
    Tournament tournament = new Tournament();
    tournament.setId(10L);
    tournament.setName("Winter Clash");
    tournament.setDescription("Tournoi test");
    tournament.setStatus(TournamentStatus.PREPARATION);
    tournament.setMaxTeams(16);

    Admin admin = new Admin();
    admin.setId(99L);
    tournament.setAdministrator(admin);

    when(tournamentService.createTournament(any(), any(Member.class))).thenReturn(tournament);

    mockMvc.perform(
            post("/tournaments")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Winter Clash",
                      "description": "Tournoi test",
                      "startDate": "2026-04-10T18:00:00",
                      "endDate": "2026-04-12T20:00:00",
                      "registrationDeadline": "2026-04-08T23:59:00",
                      "maxTeams": 16
                    }
                    """)
                .with(authentication(buildAuthentication(1L, Member.Role.ADMIN))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(10))
        .andExpect(jsonPath("$.name").value("Winter Clash"))
        .andExpect(jsonPath("$.maxTeams").value(16))
        .andExpect(jsonPath("$.status").value("PREPARATION"))
        .andExpect(jsonPath("$.administratorId").value(99));
  }

  @Test
  void getTournamentById_WhenTournamentExists_ReturnsTournamentDetails() throws Exception {
    TournamentDto tournament = new TournamentDto(
        20L,
        "Arena Cup",
        "Tournoi detail",
        "TEAM_ALPHA",
        java.time.LocalDateTime.of(2026, 4, 10, 18, 0),
        java.time.LocalDateTime.of(2026, 4, 12, 20, 0),
        java.time.LocalDateTime.of(2026, 4, 8, 23, 59),
        16,
        "INSCRIPTION",
        99L,
        2,
        java.util.List.of("Alpha", "Beta"),
        java.util.List.of()
    );

    when(tournamentService.getTournamentDtoById(20L)).thenReturn(tournament);

    mockMvc.perform(get("/tournaments/20"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(20))
        .andExpect(jsonPath("$.maxTeams").value(16))
        .andExpect(jsonPath("$.winnerTeamName").value("TEAM_ALPHA"))
        .andExpect(jsonPath("$.registeredTeamsCount").value(2))
        .andExpect(jsonPath("$.registeredTeamNames[0]").value("Alpha"));
  }

  @Test
  void getMyDraftTournaments_AsAdmin_ReturnsDrafts() throws Exception {
    TournamentDto draft = new TournamentDto(
        30L,
        "Draft Cup",
        "Brouillon admin",
        null,
        java.time.LocalDateTime.of(2026, 4, 10, 18, 0),
        java.time.LocalDateTime.of(2026, 4, 12, 20, 0),
        java.time.LocalDateTime.of(2026, 4, 8, 23, 59),
        16,
        "PREPARATION",
        99L,
        0,
        java.util.List.of(),
        java.util.List.of()
    );

    when(tournamentService.getMyDraftTournamentDtos(any(Member.class)))
        .thenReturn(java.util.List.of(draft));

    mockMvc.perform(
            get("/tournaments/my-drafts")
                .with(authentication(buildAuthentication(1L, Member.Role.ADMIN))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(30))
        .andExpect(jsonPath("$[0].name").value("Draft Cup"))
        .andExpect(jsonPath("$[0].status").value("PREPARATION"));
  }

  @Test
  void updateDraftTournament_AsAdmin_ReturnsUpdatedTournament() throws Exception {
    Tournament tournament = new Tournament();
    tournament.setId(30L);
    tournament.setName("Draft Cup Updated");
    tournament.setDescription("Brouillon mis à jour");
    tournament.setRegistrationDeadline(java.time.LocalDateTime.of(2026, 4, 8, 23, 59));
    tournament.setStartDate(java.time.LocalDateTime.of(2026, 4, 10, 18, 0));
    tournament.setEndDate(java.time.LocalDateTime.of(2026, 4, 12, 20, 0));
    tournament.setStatus(TournamentStatus.PREPARATION);
    tournament.setMaxTeams(24);

    Admin admin = new Admin();
    admin.setId(99L);
    tournament.setAdministrator(admin);

    when(tournamentService.updateDraftTournament(eq(30L), any(), any(Member.class)))
        .thenReturn(tournament);

    mockMvc.perform(
            put("/tournaments/30")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Draft Cup Updated",
                      "description": "Brouillon mis à jour",
                      "startDate": "2026-04-10T18:00:00",
                      "endDate": "2026-04-12T20:00:00",
                      "registrationDeadline": "2026-04-08T23:59:00",
                      "maxTeams": 24
                    }
                    """)
                .with(authentication(buildAuthentication(1L, Member.Role.ADMIN))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(30))
        .andExpect(jsonPath("$.name").value("Draft Cup Updated"))
        .andExpect(jsonPath("$.maxTeams").value(24))
        .andExpect(jsonPath("$.status").value("PREPARATION"));
  }

  @Test
  void publishDraftTournament_AsAdmin_ReturnsPublishedTournament() throws Exception {
    Tournament tournament = new Tournament();
    tournament.setId(31L);
    tournament.setName("Draft Cup");
    tournament.setDescription("Prêt à publier");
    tournament.setRegistrationDeadline(java.time.LocalDateTime.of(2026, 4, 8, 23, 59));
    tournament.setStartDate(java.time.LocalDateTime.of(2026, 4, 10, 18, 0));
    tournament.setEndDate(java.time.LocalDateTime.of(2026, 4, 12, 20, 0));
    tournament.setStatus(TournamentStatus.INSCRIPTION);
    tournament.setMaxTeams(16);

    Admin admin = new Admin();
    admin.setId(99L);
    tournament.setAdministrator(admin);

    when(tournamentService.publishDraftTournament(eq(31L), any(Member.class)))
        .thenReturn(tournament);

    mockMvc.perform(
            post("/tournaments/31/publish")
                .with(authentication(buildAuthentication(1L, Member.Role.ADMIN))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(31))
        .andExpect(jsonPath("$.name").value("Draft Cup"))
        .andExpect(jsonPath("$.status").value("INSCRIPTION"));
  }

  @Test
  void publishDraftTournament_WhenDraftBelongsToAnotherAdmin_ReturnsOk()
      throws Exception {
    Tournament tournament = new Tournament();
    tournament.setId(31L);
    tournament.setName("Shared Draft");
    tournament.setDescription("Brouillon partagé");
    tournament.setRegistrationDeadline(java.time.LocalDateTime.of(2026, 4, 8, 23, 59));
    tournament.setStartDate(java.time.LocalDateTime.of(2026, 4, 10, 18, 0));
    tournament.setEndDate(java.time.LocalDateTime.of(2026, 4, 12, 20, 0));
    tournament.setStatus(TournamentStatus.INSCRIPTION);
    tournament.setMaxTeams(16);

    when(tournamentService.publishDraftTournament(eq(31L), any(Member.class)))
        .thenReturn(tournament);

    mockMvc.perform(
            post("/tournaments/31/publish")
                .with(authentication(buildAuthentication(1L, Member.Role.ADMIN))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Shared Draft"))
        .andExpect(jsonPath("$.status").value("INSCRIPTION"));
  }

  @Test
  void registerMyTeamToTournament_AsResponsible_ReturnsCreatedResponse() throws Exception {
    Team team = new Team();
    team.setId(10L);

    Tournament tournament = new Tournament();
    tournament.setId(20L);

    TeamTournamentRegistration registration = new TeamTournamentRegistration();
    registration.setId(30L);
    registration.setTeam(team);
    registration.setTournament(tournament);

    when(tournamentService.registerMyTeamToTournament(eq(20L), any(Member.class)))
        .thenReturn(registration);

    mockMvc.perform(
            post("/tournaments/20/teams/me")
                .with(authentication(buildAuthentication(1L, Member.Role.RESPONSIBLE))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.message").value("Équipe inscrite au tournoi"))
        .andExpect(jsonPath("$.teamId").value(10))
        .andExpect(jsonPath("$.tournamentId").value(20));
  }

  @Test
  void registerMyTeamToTournament_WhenMemberIsNotAuthorized_ReturnsForbidden()
      throws Exception {
    when(tournamentService.registerMyTeamToTournament(eq(20L), any(Member.class)))
        .thenThrow(new ForbiddenException(
            "Seuls les responsables de l'équipe peuvent l'inscrire"));

    mockMvc.perform(
            post("/tournaments/20/teams/me")
                .with(authentication(buildAuthentication(1L, Member.Role.MEMBER))))
        .andExpect(status().isForbidden());
  }

  @Test
  void registerMyTeamToTournament_WhenTournamentIsNotFound_ReturnsNotFound()
      throws Exception {
    when(tournamentService.registerMyTeamToTournament(eq(20L), any(Member.class)))
        .thenThrow(new NotFoundException("Tournoi introuvable"));

    mockMvc.perform(
            post("/tournaments/20/teams/me")
                .with(authentication(buildAuthentication(1L, Member.Role.RESPONSIBLE))))
        .andExpect(status().isNotFound());
  }

  @Test
  void registerMyTeamToTournament_WhenBusinessRuleFails_ReturnsBadRequest()
      throws Exception {
    when(tournamentService.registerMyTeamToTournament(eq(20L), any(Member.class)))
        .thenThrow(new IllegalArgumentException(
            "Les inscriptions pour ce tournoi ne sont pas ouvertes"));

    mockMvc.perform(
            post("/tournaments/20/teams/me")
                .with(authentication(buildAuthentication(1L, Member.Role.RESPONSIBLE))))
        .andExpect(status().isBadRequest());
  }

  @Test
  void registerMyTeamToTournament_WhenTeamHasLessThanFourMembers_ReturnsBadRequest()
      throws Exception {
    when(tournamentService.registerMyTeamToTournament(eq(20L), any(Member.class)))
        .thenThrow(new IllegalArgumentException(
            "Une équipe doit compter au moins 4 membres pour s'inscrire à un tournoi"));

    mockMvc.perform(
            post("/tournaments/20/teams/me")
                .with(authentication(buildAuthentication(1L, Member.Role.RESPONSIBLE))))
        .andExpect(status().isBadRequest());
  }

  private UsernamePasswordAuthenticationToken buildAuthentication(
      Long memberId,
      Member.Role role) {
    Member member = new Member();
    member.setId(memberId);
    member.setRole(role);
    String authority = "ROLE_" + role.name();
    return new UsernamePasswordAuthenticationToken(
        member,
        null,
        java.util.List.of(new SimpleGrantedAuthority(authority)));
  }

  @TestConfiguration
  @EnableMethodSecurity
  static class TestSecurityConfig {
    @Bean
    SecurityFilterChain testFilterChain(HttpSecurity http) throws Exception {
      return http
          .csrf(AbstractHttpConfigurer::disable)
          .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
          .build();
    }
  }
}
