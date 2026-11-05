package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.dtos.PublicMemberDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Specialty;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentMatch;
import be.vinci.ipl.cae.demo.models.entities.TournamentMatchTeamSelection;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialtyRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentMatchTeamSelectionRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@ExtendWith(MockitoExtension.class)
class MemberProfileServiceTest {

  @Mock
  private BCryptPasswordEncoder passwordEncoder;

  @Mock
  private MemberRepository memberRepository;

  @Mock
  private SpecialtyRepository specialtyRepository;

  @Mock
  private TournamentMatchTeamSelectionRepository tournamentMatchTeamSelectionRepository;

  @InjectMocks
  private MemberProfileService memberProfileService;

  @Test
  void changePassword_WithThreeCharacters_AllowsUpdate() {
    Member member = new Member();
    member.setId(1L);
    member.setEmail("member@mail.com");
    member.setPasswordHash("old-hash");

    when(memberRepository.findByEmail("member@mail.com")).thenReturn(member);
    when(passwordEncoder.matches("old123", "old-hash")).thenReturn(true);
    when(passwordEncoder.matches("123", "old-hash")).thenReturn(false);
    when(passwordEncoder.encode("123")).thenReturn("new-hash");

    memberProfileService.changePassword("member@mail.com", "old123", "123");

    assertEquals("new-hash", member.getPasswordHash());
    verify(memberRepository).save(member);
  }

  @Test
  void updateSpecialty_UsesNormalizedSpecialtyCode() {
    Member member = new Member();
    member.setEmail("member@mail.com");
    Specialty specialty = new Specialty();
    specialty.setCode("TACTICIAN");

    when(memberRepository.findByEmail("member@mail.com")).thenReturn(member);
    when(specialtyRepository.findByCode("TACTICIAN")).thenReturn(Optional.of(specialty));
    when(memberRepository.save(member)).thenReturn(member);

    Member updatedMember = memberProfileService.updateSpecialty("member@mail.com", " tactician ");

    assertEquals("TACTICIAN", updatedMember.getSpecialty().getCode());
    verify(memberRepository).save(member);
  }

  @Test
  void updateProfileImage_WithInvalidImage_ThrowsException() {
    Member member = new Member();
    member.setEmail("member@mail.com");

    when(memberRepository.findByEmail("member@mail.com")).thenReturn(member);

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> memberProfileService.updateProfileImage("member@mail.com", "bad.png"));

    assertEquals("Image de profil invalide", exception.getMessage());
  }

  @Test
  void getMemberById_ReturnsPublicMemberDto() {
    Member member = new Member();
    member.setId(7L);
    member.setTag("Lynx");
    member.setCreatedAt(LocalDateTime.of(2026, 1, 1, 12, 0));
    member.setRole(Member.Role.ADMIN);
    member.setProfileImage("Avatar1.png");

    Specialty specialty = new Specialty();
    specialty.setCode("TACTICIAN");
    member.setSpecialty(specialty);

    Team team = new Team();
    team.setId(3L);
    member.setTeam(team);

    Tournament tournament = new Tournament();
    tournament.setId(10L);
    tournament.setName("Vinci Easter Cup 2026");
    tournament.setStartDate(LocalDateTime.of(2026, 4, 10, 10, 0));
    tournament.setEndDate(LocalDateTime.of(2026, 4, 12, 18, 0));
    tournament.setStatus(TournamentStatus.EN_COURS);

    TournamentMatch match = new TournamentMatch();
    match.setTournament(tournament);
    match.setStatus(TournamentMatch.Status.PUBLISHED);

    TournamentMatchTeamSelection selection = new TournamentMatchTeamSelection();
    selection.setMatch(match);
    selection.setPlayers(Set.of(member));

    when(memberRepository.findById(7L)).thenReturn(Optional.of(member));
    when(tournamentMatchTeamSelectionRepository.findAllByPlayerId(7L))
        .thenReturn(List.of(selection));

    PublicMemberDto dto = memberProfileService.getMemberById(7L);

    assertEquals(7L, dto.id());
    assertEquals("Lynx", dto.tag());
    assertEquals("TACTICIAN", dto.specialty());
    assertEquals("ADMIN", dto.role());
    assertEquals(1, dto.tournaments().size());
    assertEquals("Vinci Easter Cup 2026", dto.tournaments().get(0).name());
  }

  @Test
  void getMemberById_UsesDatesWhenTournamentStatusIsStale() {
    Member member = new Member();
    member.setId(8L);
    member.setTag("Pulse");
    member.setCreatedAt(LocalDateTime.of(2026, 1, 1, 12, 0));
    member.setRole(Member.Role.MEMBER);

    Specialty specialty = new Specialty();
    specialty.setCode("EXECUTOR");
    member.setSpecialty(specialty);

    Tournament tournament = new Tournament();
    tournament.setId(22L);
    tournament.setName("test demi finale");
    tournament.setStartDate(LocalDateTime.now().minusDays(1));
    tournament.setEndDate(LocalDateTime.now().plusDays(1));
    tournament.setStatus(TournamentStatus.INSCRIPTION);

    TournamentMatch match = new TournamentMatch();
    match.setTournament(tournament);
    match.setStatus(TournamentMatch.Status.PUBLISHED);

    TournamentMatchTeamSelection selection = new TournamentMatchTeamSelection();
    selection.setMatch(match);
    selection.setPlayers(Set.of(member));

    when(memberRepository.findById(8L)).thenReturn(Optional.of(member));
    when(tournamentMatchTeamSelectionRepository.findAllByPlayerId(8L))
        .thenReturn(List.of(selection));

    PublicMemberDto dto = memberProfileService.getMemberById(8L);

    assertEquals(1, dto.tournaments().size());
    assertEquals("test demi finale", dto.tournaments().get(0).name());
    assertEquals("EN_COURS", dto.tournaments().get(0).status());
  }
}
