package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MemberAdministrationServiceTest {

  @Mock
  private MemberRepository memberRepository;

  @Mock
  private AdminRepository adminRepository;

  @Mock
  private ResponsibleRepository responsibleRepository;

  @Mock
  private TeamRepository teamRepository;

  @Mock
  private TeamJoinRequestRepository teamJoinRequestRepository;

  @Mock
  private NotificationRepository notificationRepository;

  @Mock
  private TournamentRepository tournamentRepository;

  @Mock
  private TournamentMatchRepository tournamentMatchRepository;

  @InjectMocks
  private MemberAdministrationService memberAdministrationService;

  @Test
  void promoteToAdmin_MemberToAdmin_ReturnsAdminRole() {
    Member currentAdmin = buildMember(1L, "admin@mail.com", Role.ADMIN, false);
    Member target = buildMember(2L, "user@mail.com", Role.MEMBER, false);

    when(memberRepository.findByEmail("user@mail.com")).thenReturn(target);
    when(memberRepository.save(any(Member.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Role result = memberAdministrationService.promoteToAdmin("user@mail.com", currentAdmin);

    assertEquals(Role.ADMIN, result);
    assertEquals(Role.ADMIN, target.getRole());
    assertEquals(target, target.getAdmin().getMember());
    verify(memberRepository, times(2)).save(target);
    verify(adminRepository).save(any(Admin.class));
  }

  @Test
  void promoteToAdmin_NormalizesEmailBeforeLookup() {
    Member currentAdmin = buildMember(1L, "admin@mail.com", Role.ADMIN, false);
    Member target = buildMember(2L, "user@mail.com", Role.MEMBER, false);

    when(memberRepository.findByEmail("user@mail.com")).thenReturn(target);
    when(memberRepository.save(any(Member.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Role result = memberAdministrationService.promoteToAdmin("  USER@MAIL.COM  ", currentAdmin);

    assertEquals(Role.ADMIN, result);
    verify(memberRepository).findByEmail("user@mail.com");
  }

  @Test
  void listAdmins_AsAdmin_ReturnsSortedAdmins() {
    Member currentAdmin = buildMember(1L, "admin@mail.com", Role.ADMIN, false);
    Member first = buildMember(2L, "zzz@mail.com", Role.ADMIN, false);
    first.setTag("zzz");
    Member second = buildMember(3L, "aaa@mail.com", Role.ADMIN, false);
    second.setTag("aaa");

    when(memberRepository.findByRole(Role.ADMIN)).thenReturn(List.of(first, second));

    List<Member> result = memberAdministrationService.listAdmins(currentAdmin);

    assertEquals(2, result.size());
    assertEquals("aaa", result.get(0).getTag());
    assertEquals("zzz", result.get(1).getTag());
  }

  @Test
  void listAdmins_AsNonAdmin_ThrowsException() {
    Member currentMember = buildMember(1L, "member@mail.com", Role.MEMBER, false);

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> memberAdministrationService.listAdmins(currentMember));

    assertEquals("Action non autorisee", exception.getMessage());
  }

  @Test
  void promoteToAdmin_TargetNotFound_ThrowsException() {
    Member currentAdmin = buildMember(1L, "admin@mail.com", Role.ADMIN, false);
    when(memberRepository.findByEmail("unknown@mail.com")).thenReturn(null);

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> memberAdministrationService.promoteToAdmin("unknown@mail.com", currentAdmin));

    assertEquals("Membre non trouve", exception.getMessage());
  }

  @Test
  void promoteToAdmin_AlreadyAdmin_ThrowsException() {
    Member currentAdmin = buildMember(1L, "admin@mail.com", Role.ADMIN, false);
    Member target = buildMember(2L, "user@mail.com", Role.ADMIN, false);
    when(memberRepository.findByEmail("user@mail.com")).thenReturn(target);

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> memberAdministrationService.promoteToAdmin("user@mail.com", currentAdmin));

    assertEquals("Le membre est deja admin", exception.getMessage());
  }

  @Test
  void removeAdminRole_AdminToResponsible_WhenResponsibleExists() {
    Member currentAdmin = buildMember(1L, "admin@mail.com", Role.ADMIN, false);
    Member target = buildMember(2L, "user@mail.com", Role.ADMIN, true);

    when(memberRepository.findByEmail("user@mail.com")).thenReturn(target);
    when(memberRepository.save(any(Member.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Role result = memberAdministrationService.removeAdminRole("user@mail.com", currentAdmin);

    assertEquals(Role.RESPONSIBLE, result);
    assertEquals(Role.RESPONSIBLE, target.getRole());
    assertNull(target.getAdmin());
    verify(memberRepository).save(target);
    verify(adminRepository).delete(any(Admin.class));
  }

  @Test
  void removeAdminRole_AdminToMember_WhenNoResponsible() {
    Member currentAdmin = buildMember(1L, "admin@mail.com", Role.ADMIN, false);
    Member target = buildMember(2L, "user@mail.com", Role.ADMIN, false);

    when(memberRepository.findByEmail("user@mail.com")).thenReturn(target);
    when(memberRepository.save(any(Member.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Role result = memberAdministrationService.removeAdminRole("user@mail.com", currentAdmin);

    assertEquals(Role.MEMBER, result);
    assertEquals(Role.MEMBER, target.getRole());
    assertNull(target.getAdmin());
    verify(memberRepository).save(target);
    verify(adminRepository).delete(any(Admin.class));
  }

  @Test
  void removeAdminRole_NormalizesEmailBeforeLookup() {
    Member currentAdmin = buildMember(1L, "admin@mail.com", Role.ADMIN, false);
    Member target = buildMember(2L, "user@mail.com", Role.ADMIN, false);

    when(memberRepository.findByEmail("user@mail.com")).thenReturn(target);
    when(memberRepository.save(any(Member.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Role result = memberAdministrationService.removeAdminRole("  USER@MAIL.COM ", currentAdmin);

    assertEquals(Role.MEMBER, result);
    verify(memberRepository).findByEmail("user@mail.com");
  }

  @Test
  void removeAdminRole_ReassignsOwnedTournamentsBeforeDeletingAdmin() {
    Member currentAdmin = buildMember(1L, "admin@mail.com", Role.ADMIN, false);
    Member target = buildMember(2L, "user@mail.com", Role.ADMIN, false);
    Tournament tournament = new Tournament();
    tournament.setId(50L);
    tournament.setAdministrator(target.getAdmin());

    when(memberRepository.findByEmail("user@mail.com")).thenReturn(target);
    when(tournamentRepository.findByAdministratorId(2L)).thenReturn(List.of(tournament));
    when(memberRepository.save(any(Member.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Role result = memberAdministrationService.removeAdminRole("user@mail.com", currentAdmin);

    assertEquals(Role.MEMBER, result);
    assertEquals(currentAdmin.getAdmin(), tournament.getAdministrator());
    verify(tournamentRepository).saveAll(List.of(tournament));
    verify(adminRepository).delete(any(Admin.class));
  }

  @Test
  void removeAdminRole_TargetNotFound_ThrowsException() {
    Member currentAdmin = buildMember(1L, "admin@mail.com", Role.ADMIN, false);
    when(memberRepository.findByEmail("unknown@mail.com")).thenReturn(null);

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> memberAdministrationService.removeAdminRole("unknown@mail.com", currentAdmin));

    assertEquals("Membre non trouve", exception.getMessage());
  }

  @Test
  void removeAdminRole_TargetNotAdmin_ThrowsException() {
    Member currentAdmin = buildMember(1L, "admin@mail.com", Role.ADMIN, false);
    Member target = buildMember(2L, "user@mail.com", Role.MEMBER, false);
    when(memberRepository.findByEmail("user@mail.com")).thenReturn(target);

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> memberAdministrationService.removeAdminRole("user@mail.com", currentAdmin));

    assertEquals("Le membre n'est pas admin", exception.getMessage());
  }

  @Test
  void removeAdminRole_SelfDemote_ThrowsException() {
    Member currentAdmin = buildMember(1L, "admin@mail.com", Role.ADMIN, false);
    Member target = buildMember(1L, "admin@mail.com", Role.ADMIN, false);
    when(memberRepository.findByEmail("admin@mail.com")).thenReturn(target);

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> memberAdministrationService.removeAdminRole("admin@mail.com", currentAdmin));

    assertEquals("Un admin ne peut pas retirer son propre statut admin", exception.getMessage());
  }

  @Test
  void deleteMember_AdminWithoutTeam_CleansAdminRelationAndDeletesMember() {
    Member currentAdmin = buildMember(1L, "admin@mail.com", Role.ADMIN, false);
    Member target = buildMember(2L, "target@mail.com", Role.ADMIN, false);
    Tournament tournament = new Tournament();
    tournament.setId(51L);
    tournament.setAdministrator(target.getAdmin());

    when(memberRepository.findById(2L)).thenReturn(java.util.Optional.of(target));
    when(teamJoinRequestRepository.findByMemberId(2L)).thenReturn(List.of());
    when(notificationRepository.findBySenderId(2L)).thenReturn(List.of());
    when(tournamentRepository.findByAdministratorId(2L)).thenReturn(List.of(tournament));
    when(memberRepository.save(any(Member.class))).thenAnswer(invocation -> invocation.getArgument(0));

    memberAdministrationService.banMember(2L, currentAdmin);

    assertNull(target.getAdmin());
    assertNotNull(target.getBannedAt());
    assertEquals(currentAdmin.getAdmin(), tournament.getAdministrator());
    verify(adminRepository).delete(any(Admin.class));
    verify(tournamentRepository).saveAll(List.of(tournament));
    verify(memberRepository).save(target);
    verify(memberRepository, never()).deleteById(anyLong());
  }

  private Member buildMember(Long id, String email, Role role, boolean hasResponsible) {
    Member member = new Member();
    member.setId(id);
    member.setEmail(email);
    member.setRole(role);
    if (role == Role.ADMIN) {
      Admin admin = new Admin();
      admin.setId(id);
      admin.setMember(member);
      member.setAdmin(admin);
    }
    if (hasResponsible) {
      Responsible responsible = new Responsible();
      responsible.setId(100L + id);
      member.setResponsible(responsible);
    }
    return member;
  }
}
