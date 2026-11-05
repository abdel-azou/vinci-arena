package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.mappers.TournamentMatchMapper;
import be.vinci.ipl.cae.demo.models.dtos.PublicMemberDto;
import be.vinci.ipl.cae.demo.models.dtos.PublicMemberTournamentDto;
import be.vinci.ipl.cae.demo.models.dtos.TournamentMatchDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Specialty;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentMatch;
import be.vinci.ipl.cae.demo.models.entities.TournamentMatchTeamSelection;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialtyRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentMatchTeamSelectionRepository;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service dedicated to member profile and public profile operations.
 */
@Service
public class MemberProfileService {

  private static final Set<String> ALLOWED_PROFILE_IMAGES =
      IntStream.rangeClosed(1, 20)
          .mapToObj(index -> "Avatar" + index + ".png")
          .collect(Collectors.toUnmodifiableSet());

  private final BCryptPasswordEncoder passwordEncoder;
  private final MemberRepository memberRepository;
  private final SpecialtyRepository specialtyRepository;
  private final TournamentMatchTeamSelectionRepository tournamentMatchTeamSelectionRepository;

  /**
   * Creates the service responsible for member profile operations.
   *
   * @param passwordEncoder encoder used for password updates
   * @param memberRepository repository used to load and save members
   * @param specialtyRepository repository used to resolve specialties
   * @param tournamentMatchTeamSelectionRepository repository used to fetch member selections
   */
  public MemberProfileService(
      BCryptPasswordEncoder passwordEncoder,
      MemberRepository memberRepository,
      SpecialtyRepository specialtyRepository,
      TournamentMatchTeamSelectionRepository tournamentMatchTeamSelectionRepository) {
    this.passwordEncoder = passwordEncoder;
    this.memberRepository = memberRepository;
    this.specialtyRepository = specialtyRepository;
    this.tournamentMatchTeamSelectionRepository = tournamentMatchTeamSelectionRepository;
  }

  /**
   * Changes a member password after validating current and new passwords.
   *
   * @param email member email
   * @param currentPassword current raw password
   * @param newPassword new raw password
   */
  public void changePassword(String email, String currentPassword, String newPassword) {
    Member member = memberRepository.findByEmail(email);

    if (member == null) {
      throw new IllegalArgumentException("Membre introuvable");
    }

    if (!passwordEncoder.matches(currentPassword, member.getPasswordHash())) {
      throw new IllegalArgumentException("Mot de passe actuel incorrect");
    }

    if (newPassword == null || newPassword.isBlank()) {
      throw new IllegalArgumentException("Le nouveau mot de passe est obligatoire");
    }

    if (passwordEncoder.matches(newPassword, member.getPasswordHash())) {
      throw new IllegalArgumentException(
          "Le nouveau mot de passe doit etre different de l'ancien");
    }

    member.setPasswordHash(passwordEncoder.encode(newPassword));
    memberRepository.save(member);
  }

  /**
   * Updates a member's specialty.
   *
   * @param email member email
   * @param specialtyCode new specialty code
   * @return updated member
   */
  public Member updateSpecialty(String email, String specialtyCode) {
    Member member = memberRepository.findByEmail(email);

    if (member == null) {
      throw new IllegalArgumentException("Membre introuvable");
    }

    Specialty newSpecialty = resolveSpecialty(specialtyCode);
    member.setSpecialty(newSpecialty);
    return memberRepository.save(member);
  }

  /**
   * Updates a member's profile image.
   *
   * @param email member email
   * @param profileImage image file name
   * @return updated member
   */
  public Member updateProfileImage(String email, String profileImage) {
    Member member = memberRepository.findByEmail(email);

    if (member == null) {
      throw new IllegalArgumentException("Membre introuvable");
    }

    if (profileImage == null || profileImage.isBlank()) {
      throw new IllegalArgumentException("L'image de profil est obligatoire");
    }

    if (!ALLOWED_PROFILE_IMAGES.contains(profileImage)) {
      throw new IllegalArgumentException("Image de profil invalide");
    }

    member.setProfileImage(profileImage);
    return memberRepository.save(member);
  }

  /**
   * Returns the public profile of a member.
   *
   * @param id member id
   * @return public dto
   * @throws IllegalArgumentException if member not found or is banned
   */
  public PublicMemberDto getMemberById(Long id) {
    Member member = memberRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Membre introuvable"));

    // Hide banned members' profiles
    if (member.isBanned()) {
      throw new IllegalArgumentException("Membre introuvable");
    }

    String teamName = member.getTeam() != null ? member.getTeam().getNom() : null;
    List<PublicMemberTournamentDto> tournaments = tournamentMatchTeamSelectionRepository
        .findAllByPlayerId(member.getId())
        .stream()
        .map(TournamentMatchTeamSelection::getMatch)
        .filter(match -> match != null)
        .map(TournamentMatch::getTournament)
        .filter(tournament -> tournament != null)
        .sorted(Comparator.comparing(Tournament::getStartDate))
        .collect(Collectors.toMap(
            Tournament::getId,
            tournament -> new PublicMemberTournamentDto(
                tournament.getId(),
                tournament.getName(),
                tournament.getStartDate(),
                tournament.getEndDate(),
          resolveProfileStatus(tournament).name()),
            (first, ignored) -> first,
            LinkedHashMap::new))
        .values()
        .stream()
        .toList();

    return new PublicMemberDto(
        member.getId(),
        member.getTag(),
        member.getSpecialty().getCode(),
        member.getProfileImage(),
        teamName,
        tournaments,
        member.getCreatedAt(),
        member.getRole().name());
  }

  /**
   * Returns all members sorted alphabetically by tag.
   *
   * @return list of public member dtos sorted by tag
   */
  public List<PublicMemberDto> getAllMembersSortedByTag() {
    return ((List<Member>) memberRepository.findAll()).stream()
        .filter(member -> !member.isBanned())
        .sorted(Comparator.comparing(Member::getTag, String.CASE_INSENSITIVE_ORDER))
        .map(member -> {
          String teamName = member.getTeam() != null ? member.getTeam().getNom() : null;
          return new PublicMemberDto(
              member.getId(),
              member.getTag(),
              member.getSpecialty().getCode(),
              member.getProfileImage(),
              teamName,
              List.of(),
              member.getCreatedAt(),
              member.getRole().name());
        })
        .toList();
  }

  private TournamentStatus resolveProfileStatus(Tournament tournament) {
    LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
    if (now.isAfter(tournament.getEndDate())) {
      return TournamentStatus.TERMINE;
    }
    if (!now.isBefore(tournament.getStartDate())) {
      return TournamentStatus.EN_COURS;
    }
    return TournamentStatus.INSCRIPTION;
  }

  private Specialty resolveSpecialty(String specialtyCode) {
    String normalizedCode = normalizeSpecialtyCode(specialtyCode);
    return specialtyRepository.findByCode(normalizedCode)
        .orElseThrow(() -> new IllegalArgumentException("Specialite invalide"));
  }

  private String normalizeSpecialtyCode(String specialtyCode) {
    if (specialtyCode == null || specialtyCode.isBlank()) {
      throw new IllegalArgumentException("La specialite est obligatoire");
    }
    return specialtyCode.trim().toUpperCase(Locale.ROOT);
  }

  /**
   * Returns all matches for a member in a specific tournament.
   *
   * @param memberId the member id
   * @param tournamentId the tournament id
   * @return list of tournament matches where member participates
   * @throws IllegalArgumentException if member not found or is banned
   */
  public List<TournamentMatchDto> getMemberTournamentMatches(Long memberId, Long tournamentId) {
    Member member = memberRepository.findById(memberId)
        .orElseThrow(() -> new IllegalArgumentException("Membre introuvable"));

    if (member.isBanned()) {
      throw new IllegalArgumentException("Membre introuvable");
    }

    return tournamentMatchTeamSelectionRepository.findAllByPlayerId(memberId)
        .stream()
        .map(TournamentMatchTeamSelection::getMatch)
        .filter(match -> match != null && match.getTournament() != null)
        .filter(match -> match.getTournament().getId().equals(tournamentId))
        .map(TournamentMatchMapper::toDto)
        .toList();
  }
}
