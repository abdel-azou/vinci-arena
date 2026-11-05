package be.vinci.ipl.cae.demo.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import be.vinci.ipl.cae.demo.exceptions.NotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.PublicMemberDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Member.Role;
import be.vinci.ipl.cae.demo.services.MemberAdministrationService;
import be.vinci.ipl.cae.demo.services.MemberProfileService;
import be.vinci.ipl.cae.demo.services.MemberService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

@WebMvcTest(MemberController.class)
@Import(MemberControllerAdminTest.TestSecurityConfig.class)
class MemberControllerAdminTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private MemberService memberService;

  @MockBean
  private MemberAdministrationService memberAdministrationService;

  @MockBean
  private MemberProfileService memberProfileService;

  @Test
  void getMemberById_AsGuest_ReturnsOk() throws Exception {
    PublicMemberDto dto = new PublicMemberDto(
        7L,
        "Lynx",
        "TACTICIAN",
        null,
        "TEAM_ALPHA",
        List.of(),
        null,
        "ADMIN");

    when(memberProfileService.getMemberById(7L)).thenReturn(dto);

    mockMvc.perform(get("/members/7"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(7))
        .andExpect(jsonPath("$.tag").value("Lynx"))
        .andExpect(jsonPath("$.teamName").value("TEAM_ALPHA"));
  }

  @Test
  void listAdmins_AsAdmin_ReturnsOk() throws Exception {
    Member first = new Member();
    first.setEmail("admin1@mail.com");
    first.setTag("admin1");
    first.setRole(Role.ADMIN);
    Member second = new Member();
    second.setEmail("admin2@mail.com");
    second.setTag("admin2");
    second.setRole(Role.ADMIN);

    when(memberAdministrationService.listAdmins(any(Member.class))).thenReturn(List.of(first, second));

    mockMvc.perform(
            get("/members/admin")
                .with(authentication(buildAuthentication(1L, Role.ADMIN))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].email").value("admin1@mail.com"))
        .andExpect(jsonPath("$[0].tag").value("admin1"))
        .andExpect(jsonPath("$[1].email").value("admin2@mail.com"))
        .andExpect(jsonPath("$[1].tag").value("admin2"));
  }

  @Test
  void listAdmins_AsNonAdmin_ReturnsForbidden() throws Exception {
    mockMvc.perform(
            get("/members/admin")
                .with(authentication(buildAuthentication(3L, Role.MEMBER))))
        .andExpect(status().isForbidden());

    verifyNoInteractions(memberAdministrationService);
  }

  @Test
  void promoteMemberToAdmin_AsAdmin_ReturnsOk() throws Exception {
    when(memberAdministrationService.promoteToAdmin(eq("user@mail.com"), any(Member.class)))
        .thenReturn(Role.ADMIN);

    mockMvc.perform(
            post("/members/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"user@mail.com\"}")
                .with(authentication(buildAuthentication(1L, Role.ADMIN))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Statut admin attribue"))
        .andExpect(jsonPath("$.role").value("ADMIN"));
  }

  @Test
  void promoteMemberToAdmin_AsNonAdmin_ReturnsForbidden() throws Exception {
    mockMvc.perform(
            post("/members/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"user@mail.com\"}")
                .with(authentication(buildAuthentication(3L, Role.MEMBER))))
        .andExpect(status().isForbidden());

    verifyNoInteractions(memberAdministrationService);
  }

  @Test
  void removeMemberAdminRole_AsAdmin_ReturnsOk() throws Exception {
    when(memberAdministrationService.removeAdminRole(eq("user@mail.com"), any(Member.class)))
        .thenReturn(Role.MEMBER);

    mockMvc.perform(
            delete("/members/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"user@mail.com\"}")
                .with(authentication(buildAuthentication(1L, Role.ADMIN))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Statut admin retire"))
        .andExpect(jsonPath("$.role").value("MEMBER"));
  }

  @Test
  void removeMemberAdminRole_AsNonAdmin_ReturnsForbidden() throws Exception {
    mockMvc.perform(
            delete("/members/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"user@mail.com\"}")
                .with(authentication(buildAuthentication(3L, Role.MEMBER))))
        .andExpect(status().isForbidden());

    verifyNoInteractions(memberAdministrationService);
  }

  @Test
  void banMember_AsAdmin_ReturnsOk() throws Exception {
    mockMvc.perform(
            delete("/members/7")
                .with(authentication(buildAuthentication(1L, Role.ADMIN))))
        .andExpect(status().isOk());
  }

  @Test
  void banMember_TargetNotFound_ReturnsNotFound() throws Exception {
    doThrow(new NotFoundException("Membre introuvable"))
        .when(memberAdministrationService)
        .banMember(eq(7L), any(Member.class));

    mockMvc.perform(
            delete("/members/7")
                .with(authentication(buildAuthentication(1L, Role.ADMIN))))
        .andExpect(status().isNotFound());
  }

  @Test
  void banMember_SelfBan_ReturnsBadRequest() throws Exception {
    doThrow(new IllegalArgumentException("Un admin ne peut pas se bannir lui-meme"))
        .when(memberAdministrationService)
        .banMember(eq(1L), any(Member.class));

    mockMvc.perform(
            delete("/members/1")
                .with(authentication(buildAuthentication(1L, Role.ADMIN))))
        .andExpect(status().isBadRequest());
  }

  private UsernamePasswordAuthenticationToken buildAuthentication(Long memberId, Role role) {
    Member member = new Member();
    member.setId(memberId);
    member.setRole(role);
    String authority = "ROLE_" + role.name();
    return new UsernamePasswordAuthenticationToken(
        member,
        null,
        List.of(new SimpleGrantedAuthority(authority))
    );
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
