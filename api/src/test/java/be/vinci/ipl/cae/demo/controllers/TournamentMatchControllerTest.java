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

import be.vinci.ipl.cae.demo.models.dtos.TournamentMatchDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.services.MemberService;
import be.vinci.ipl.cae.demo.services.TournamentService;
import java.time.LocalDateTime;
import java.util.List;
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

@WebMvcTest(TournamentMatchController.class)
@Import(TournamentMatchControllerTest.TestSecurityConfig.class)
class TournamentMatchControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private TournamentService tournamentService;

  @MockBean
  private MemberService memberService;

  @Test
  void generateMatches_AsAdmin_ReturnsMatches() throws Exception {
    TournamentMatchDto match = buildMatchDto(1L, "PLANNED");
    when(tournamentService.generateTournamentMatches(eq(10L), any(Member.class)))
        .thenReturn(List.of(match));

    mockMvc.perform(
            post("/tournaments/10/matches/generate")
                .with(authentication(buildAuthentication(1L, Member.Role.ADMIN))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$[0].id").value(1))
        .andExpect(jsonPath("$[0].round").value("FINAL"));
  }

  @Test
  void getMatches_ReturnsMatches() throws Exception {
    when(tournamentService.getTournamentMatches(10L, null))
        .thenReturn(List.of(buildMatchDto(2L, "PLANNED")));

    mockMvc.perform(get("/tournaments/10/matches"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].teamAName").value("TEAM_ALPHA"))
        .andExpect(jsonPath("$[0].teamBName").value("TEAM_BETA"));
  }

  @Test
  void updateMatch_AsAdmin_ReturnsUpdatedMatch() throws Exception {
    when(tournamentService.updateTournamentMatch(eq(10L), eq(3L), any(), any(Member.class)))
        .thenReturn(buildMatchDto(3L, "PLANNED"));

    mockMvc.perform(
            put("/tournaments/10/matches/3")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "teamAId": 5,
                      "teamBId": 6,
                      "scheduledDate": "2026-04-10T18:00:00"
                    }
                    """)
                .with(authentication(buildAuthentication(1L, Member.Role.ADMIN))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(3))
        .andExpect(jsonPath("$.teamAName").value("TEAM_ALPHA"));
  }

  @Test
  void publishMatches_AsAdmin_ReturnsOk() throws Exception {
    mockMvc.perform(
            post("/tournaments/10/matches/publish")
                .with(authentication(buildAuthentication(1L, Member.Role.ADMIN))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Planning publié"));
  }

  @Test
  void updateMatchSelection_AsResponsible_ReturnsUpdatedMatch() throws Exception {
    when(tournamentService.updateMatchSelection(eq(10L), eq(3L), any(), any(Member.class)))
        .thenReturn(buildMatchDto(3L, "PUBLISHED"));

    mockMvc.perform(
            put("/tournaments/10/matches/3/selection")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "playerIds": [1, 2, 3, 4]
                    }
                    """)
                .with(authentication(buildAuthentication(1L, Member.Role.RESPONSIBLE))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(3));
  }

  @Test
  void updateMatchResult_AsAdmin_ReturnsUpdatedMatch() throws Exception {
    TournamentMatchDto match = new TournamentMatchDto(
        4L,
        10L,
        5L,
        "TEAM_ALPHA",
        6L,
        "TEAM_BETA",
        "FINAL",
        LocalDateTime.of(2026, 4, 10, 18, 0),
        "PUBLISHED",
        99L,
        List.of(),
        List.of(),
        false,
        3,
        1,
        "PENDING_CONFIRMATION",
        "PENDING",
        "PENDING"
    );
    when(tournamentService.updateMatchResult(eq(10L), eq(4L), any(), any(Member.class)))
        .thenReturn(match);

    mockMvc.perform(
            put("/tournaments/10/matches/4/result")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "teamAScore": 3,
                      "teamBScore": 1
                    }
                    """)
                .with(authentication(buildAuthentication(1L, Member.Role.ADMIN))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.teamAScore").value(3))
        .andExpect(jsonPath("$.resultStatus").value("PENDING_CONFIRMATION"));
  }

  @Test
  void respondToMatchResult_AsResponsible_ReturnsUpdatedMatch() throws Exception {
    TournamentMatchDto match = new TournamentMatchDto(
        4L,
        10L,
        5L,
        "TEAM_ALPHA",
        6L,
        "TEAM_BETA",
        "FINAL",
        LocalDateTime.of(2026, 4, 10, 18, 0),
        "COMPLETED",
        99L,
        List.of(),
        List.of(),
        false,
        3,
        1,
        "CONFIRMED",
        "CONFIRMED",
        "CONFIRMED"
    );
    when(tournamentService.respondToMatchResult(eq(10L), eq(4L), any(), any(Member.class)))
        .thenReturn(match);

    mockMvc.perform(
            post("/tournaments/10/matches/4/result-response")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "action": "CONFIRM"
                    }
                    """)
                .with(authentication(buildAuthentication(1L, Member.Role.RESPONSIBLE))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.resultStatus").value("CONFIRMED"));
  }

  private TournamentMatchDto buildMatchDto(Long id, String status) {
    return new TournamentMatchDto(
        id,
        10L,
        5L,
        "TEAM_ALPHA",
        6L,
        "TEAM_BETA",
        "FINAL",
        LocalDateTime.of(2026, 4, 10, 18, 0),
        status,
        99L,
        List.of(),
        List.of(),
        false,
        null,
        null,
        "NOT_ENCODED",
        "PENDING",
        "PENDING"
    );
  }

  private UsernamePasswordAuthenticationToken buildAuthentication(Long id, Member.Role role) {
    Member member = new Member();
    member.setId(id);
    member.setRole(role);
    return new UsernamePasswordAuthenticationToken(
        member,
        null,
        List.of(new SimpleGrantedAuthority("ROLE_" + role.name())));
  }

  @EnableMethodSecurity
  @TestConfiguration
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
