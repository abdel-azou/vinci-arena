package be.vinci.ipl.cae.demo.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import be.vinci.ipl.cae.demo.exceptions.ForbiddenException;
import be.vinci.ipl.cae.demo.exceptions.NotFoundException;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Responsible;
import be.vinci.ipl.cae.demo.models.entities.Specialty;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.dtos.TeamDto;
import be.vinci.ipl.cae.demo.models.dtos.ResponsibleDto;
import be.vinci.ipl.cae.demo.services.MemberService;
import be.vinci.ipl.cae.demo.services.TeamJoinRequestService;
import be.vinci.ipl.cae.demo.services.TeamService;
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

@WebMvcTest(TeamController.class)
@Import(TeamControllerAssignSecondResponsibleTest.TestSecurityConfig.class)
class TeamControllerAssignSecondResponsibleTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private MemberService memberService;

  @MockBean
  private TeamService teamService;

  @MockBean
  private TeamJoinRequestService teamJoinRequestService;

  @Test
  void getTeams_AsGuest_ReturnsOk() throws Exception {
    TeamDto team = new TeamDto(
        10L,
        "Vinci",
        new ResponsibleDto(100L, "captain"),
        new ResponsibleDto(200L, "second"),
        List.of("Vinci Easter Cup 2026"));
    when(teamService.findAllTeamDtos()).thenReturn(List.of(team));

    mockMvc.perform(get("/teams"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(10))
        .andExpect(jsonPath("$[0].nom").value("Vinci"))
        .andExpect(jsonPath("$[0].responsible.tag").value("captain"))
        .andExpect(jsonPath("$[0].registeredTournamentNames[0]").value("Vinci Easter Cup 2026"));
  }

  @Test
  void getTeamMembers_AsGuest_ReturnsOk() throws Exception {
    Member first = new Member();
    first.setId(1L);
    first.setTag("captain");
    first.setRole(Member.Role.RESPONSIBLE);
    Specialty tactician = new Specialty();
    tactician.setCode("TACTICIAN");
    first.setSpecialty(tactician);

    Member second = new Member();
    second.setId(2L);
    second.setTag("second");
    second.setRole(Member.Role.MEMBER);
    Specialty guardian = new Specialty();
    guardian.setCode("GUARDIAN");
    second.setSpecialty(guardian);

    when(teamService.getTeamMembers(10L)).thenReturn(java.util.List.of(first, second));

    mockMvc.perform(get("/teams/10/members"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(1))
        .andExpect(jsonPath("$[0].tag").value("captain"))
        .andExpect(jsonPath("$[1].id").value(2))
        .andExpect(jsonPath("$[1].tag").value("second"));
  }

  @Test
  void assignSecondResponsible_ValidRequest_ReturnsUpdatedTeam() throws Exception {
    Team team = buildTeam(10L, "captain", 2L, "second");
    when(teamService.assignSecondResponsible(eq(2L), any(Member.class))).thenReturn(team);

    mockMvc.perform(
            patch("/teams/my/second-responsible")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"memberId\":2}")
                .with(authentication(buildAuthentication(1L, "captain", Member.Role.RESPONSIBLE))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(10))
        .andExpect(jsonPath("$.responsible.tag").value("captain"))
        .andExpect(jsonPath("$.secondResponsible.tag").value("second"));
  }

  @Test
  void assignSecondResponsible_NotTeamResponsible_ReturnsForbiddenWithMessage() throws Exception {
    String message = "Seul un responsable de l'équipe peut nommer un second responsable";
    when(teamService.assignSecondResponsible(eq(2L), any(Member.class)))
        .thenThrow(new ForbiddenException(message));

    mockMvc.perform(
            patch("/teams/my/second-responsible")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"memberId\":2}")
                .with(authentication(buildAuthentication(3L, "second", Member.Role.RESPONSIBLE))))
        .andExpect(status().isForbidden())
        .andExpect(status().reason(message));
  }

  @Test
  void assignSecondResponsible_MemberNotFound_ReturnsNotFoundWithMessage() throws Exception {
    when(teamService.assignSecondResponsible(eq(999L), any(Member.class)))
        .thenThrow(new NotFoundException("Membre introuvable"));

    mockMvc.perform(
            patch("/teams/my/second-responsible")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"memberId\":999}")
                .with(authentication(buildAuthentication(1L, "captain", Member.Role.RESPONSIBLE))))
        .andExpect(status().isNotFound())
        .andExpect(status().reason("Membre introuvable"));
  }

  private Team buildTeam(Long teamId, String responsibleTag, Long secondId, String secondTag) {
    Member responsibleMember = new Member();
    responsibleMember.setId(1L);
    responsibleMember.setTag(responsibleTag);

    Responsible responsible = new Responsible();
    responsible.setId(100L);
    responsible.setMember(responsibleMember);

    Member secondMember = new Member();
    secondMember.setId(secondId);
    secondMember.setTag(secondTag);

    Responsible secondResponsible = new Responsible();
    secondResponsible.setId(200L);
    secondResponsible.setMember(secondMember);

    Team team = new Team();
    team.setId(teamId);
    team.setNom("Vinci");
    team.setResponsible(responsible);
    team.setSecondResponsible(secondResponsible);
    return team;
  }

  private UsernamePasswordAuthenticationToken buildAuthentication(
      Long memberId,
      String tag,
      Member.Role role) {
    Member member = new Member();
    member.setId(memberId);
    member.setTag(tag);
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
