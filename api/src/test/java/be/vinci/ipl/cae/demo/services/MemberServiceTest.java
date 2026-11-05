package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Member.Role;
import be.vinci.ipl.cae.demo.models.entities.Responsible;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialtyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Unit tests for MemberService admin role management.
 */
@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

  @Mock
  private BCryptPasswordEncoder passwordEncoder;

  @Mock
  private MemberRepository memberRepository;

  @Mock
  private TeamService teamService;

  @Mock
  private SpecialtyRepository specialtyRepository;

  @Mock
  private CurrentMemberResolver currentMemberResolver;

  @Mock
  private TeamMembershipTransitionService teamMembershipTransitionService;

  @InjectMocks
  private MemberService memberService;

  @Test
  void createJwtToken_IncludesMemberId() {
    Member member = buildMember(5L, "member@mail.com", Role.ADMIN, true);
    member.setTag("Lynx");

    var specialty = new be.vinci.ipl.cae.demo.models.entities.Specialty();
    specialty.setCode("TACTICIAN");
    member.setSpecialty(specialty);

    var authenticatedMember = memberService.createJwtToken(member, false);

    assertEquals(5L, authenticatedMember.id());
    assertEquals("Lynx", authenticatedMember.tag());
    assertEquals(Role.ADMIN, authenticatedMember.role());
  }

  @Test
  void leaveTeam_MainResponsibleAndLastMember_KeepsTeamAndDemotesMember() {
    Member member = buildMember(1L, "member@mail.com", Role.RESPONSIBLE, true);
    Team team = new Team();
    team.setId(10L);
    member.setTeam(team);

    when(currentMemberResolver.resolve(member)).thenReturn(member);

    memberService.leaveTeam(member);

    verify(teamMembershipTransitionService).detachMemberFromCurrentTeam(member);
  }

  @Test
  void leaveTeam_MainResponsibleWithOtherMembers_TransfersResponsibility() {
    Member member = buildMember(1L, "member@mail.com", Role.RESPONSIBLE, true);
    Team team = new Team();
    team.setId(10L);
    member.setTeam(team);

    when(currentMemberResolver.resolve(member)).thenReturn(member);

    memberService.leaveTeam(member);

    verify(teamMembershipTransitionService).detachMemberFromCurrentTeam(member);
  }

  @Test
  void leaveTeam_SecondResponsible_LeavesTeamAndClearsSecondResponsible() {
    Member secondResponsibleMember = buildMember(2L, "second@mail.com", Role.RESPONSIBLE, true);
    Team team = new Team();
    team.setId(10L);
    secondResponsibleMember.setTeam(team);

    when(currentMemberResolver.resolve(secondResponsibleMember)).thenReturn(secondResponsibleMember);

    memberService.leaveTeam(secondResponsibleMember);

    verify(teamMembershipTransitionService).detachMemberFromCurrentTeam(secondResponsibleMember);
  }

  private Member buildMember(Long id, String email, Role role, boolean hasResponsible) {
    Member member = new Member();
    member.setId(id);
    member.setEmail(email);
    member.setTag("member" + id);
    member.setRole(role);
    var specialty = new be.vinci.ipl.cae.demo.models.entities.Specialty();
    specialty.setCode("TACTICIAN");
    member.setSpecialty(specialty);
    if (hasResponsible) {
      Responsible responsible = new Responsible();
      responsible.setId(100L + id);
      member.setResponsible(responsible);
    }
    return member;
  }
}
