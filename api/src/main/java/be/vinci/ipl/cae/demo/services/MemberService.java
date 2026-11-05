package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedMember;
import be.vinci.ipl.cae.demo.models.dtos.CreateTeamRequest;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Member.Role;
import be.vinci.ipl.cae.demo.models.entities.Responsible;
import be.vinci.ipl.cae.demo.models.entities.Specialty;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialtyRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Locale;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Member service.
 */
@Service
public class MemberService {

  private static final String jwtSecret =
      System.getenv().getOrDefault("JWT_SECRET", "local-dev-only-change-me-please");
  private static final long lifetimeJwtShort = 24 * 60 * 60 * 1000;  // 24h
  private static final long lifetimeJwtLong = 30L * 24 * 60 * 60 * 1000;  // 30d (remember me)

  private static final Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
  private final BCryptPasswordEncoder passwordEncoder;
  private final MemberRepository memberRepository;
  private final TeamService teamService;
  private final SpecialtyRepository specialtyRepository;
  private final CurrentMemberResolver currentMemberResolver;
  private final TeamMembershipTransitionService teamMembershipTransitionService;

  /**
   * Constructor for MemberService.
   *
   * @param passwordEncoder       the encoder used for hashing passwords
   * @param memberRepository      the repository for accessing and managing members
   * @param teamService           the service for managing teams, injected for team-related
   *                              operations
   */
  public MemberService(BCryptPasswordEncoder passwordEncoder,
                       MemberRepository memberRepository,
                       TeamService teamService,
                       SpecialtyRepository specialtyRepository,
                       CurrentMemberResolver currentMemberResolver,
                       TeamMembershipTransitionService teamMembershipTransitionService) {
    this.passwordEncoder = passwordEncoder;
    this.memberRepository = memberRepository;
    this.teamService = teamService;
    this.specialtyRepository = specialtyRepository;
    this.currentMemberResolver = currentMemberResolver;
    this.teamMembershipTransitionService = teamMembershipTransitionService;
  }

  /**
   * Create JWT with specialty claim.
   */
  public AuthenticatedMember createJwtToken(Member member, boolean rememberMe) {
    String token = JWT.create()
        .withIssuer("vinci-arena")
        .withClaim("tag", member.getTag())
        .withClaim("email", member.getEmail())
        .withClaim("specialty", member.getSpecialty().getCode())
        .withIssuedAt(new Date())
        .withExpiresAt(new Date(System.currentTimeMillis()
            + (rememberMe ? lifetimeJwtLong : lifetimeJwtShort)))
        .sign(algorithm);

    return new AuthenticatedMember(
        member.getId(),
        member.getTag(),
        member.getEmail(),
        token,
        member.getCreatedAt(),
        member.getSpecialty().getCode(),
        member.getProfileImage(),
        member.getRole(),
        member.getTeam() != null ? member.getTeam().getId() : null,
        member.getResponsible() != null);
  }

  /**
   * Reloads the authenticated member from database before exposing fresh state.
   *
   * @param currentMember principal resolved from security context
   * @return current persisted member
   */
  public Member refreshCurrentMember(Member currentMember) {
    Member refreshedMember = currentMemberResolver.resolve(currentMember);
    if (refreshedMember == null) {
      throw new IllegalArgumentException("Membre introuvable");
    }
    return refreshedMember;
  }

  /**
   * Updated login with email.
   */
  public AuthenticatedMember login(String email, String password, boolean rememberMe) {
    Member member = memberRepository.findByEmail(email);  //  email
    if (member == null) {
      return null;
    }

    // Check if member is banned
    if (member.isBanned()) {
      throw new IllegalStateException("Ce compte a été banni");
    }

    if (!passwordEncoder.matches(password, member.getPasswordHash())) {
      return null;
    }

    // rememberMe depuis Credentials (passé par controller)
    return createJwtToken(member, rememberMe);  // default 24h
  }

  /**
   * Updated register avec tag + specialty.
   */
  public boolean register(String email, String tag, String password,
      String specialtyCode, String profileImage) {
    // Check email exists (including banned members)
    Member existingMember = memberRepository.findByEmail(email);
    if (existingMember != null) {
      return false;
    }

    createOne(email, tag, password, specialtyCode, profileImage);
    return true;
  }

  /**
   * Create Member avec tous les champs.
   */
  public void createOne(
      String email,
      String tag,
      String password,
      String specialtyCode,
      String profileImage) {
    Specialty specialty = resolveSpecialty(specialtyCode);
    String hashedPassword = passwordEncoder.encode(password);

    Member member = new Member();
    member.setEmail(email);
    member.setTag(tag);
    member.setPasswordHash(hashedPassword);
    member.setSpecialty(specialty);
    member.setProfileImage(profileImage);
    member.setCreatedAt(LocalDateTime.now());

    memberRepository.save(member);
  }

  /**
   * Read by email.
   */
  public Member readOneFromEmail(String email) {
    return memberRepository.findByEmail(email);
  }

  /**
   * Read by tag = username.
   */
  public Member readOneFromUsername(String tag) {
    return memberRepository.findByTag(tag);
  }

  /**
   * Verify JWT.
   */
  public String verifyJwtToken(String token) {
    try {
      return JWT.require(algorithm).build()
          .verify(token)
          .getClaim("email").asString();
    } catch (Exception e) {
      return null;
    }
  }

  /**
   * Creates a team for the current member. If the member is not already a responsible, it
   * automatically creates a Responsible entity and upgrades the member's role.
   *
   * @param dto     the data transfer object containing team creation details
   * @param current the current member creating the team
   * @return the created Team entity
   */
  @Transactional
  public Team createTeamForCurrent(CreateTeamRequest dto, Member current) {
    // 1. On récupère le membre EXISTANT en base de données (pour qu'il soit "attaché")
    Member member = currentMemberResolver.resolve(current);
    if (member == null) {
      throw new IllegalArgumentException("Membre non trouvé");
    }

    Responsible resp = member.getResponsible();

    // 2. Si le membre n'est pas encore responsable, on l'upgrade
    if (resp == null) {
      resp = new Responsible();
      resp.setMember(member); // On lie le responsable au membre existant

      //Mettre à jour le membre (Upgrade)
      member.setResponsible(resp);
      if (member.getRole() != Role.ADMIN) {
        member.setRole(Role.RESPONSIBLE);
      }

      member = memberRepository.save(member);
      resp = member.getResponsible();

    }

    // 3. On crée l'équipe avec ce responsable (qui existe maintenant)
    Team team = teamService.createTeam(dto.nom(), resp, dto.secondResponsibleId());

    member.setTeam(team);
    memberRepository.save(member);

    return team;
  }

  /**
   * Permet au membre actuel de quitter son équipe.
    *
   * @param current le membre authentifié
   */
  @Transactional
  public AuthenticatedMember leaveTeam(Member current) {
    Member member = currentMemberResolver.resolve(current);

    if (member.getTeam() == null) {
      throw new IllegalArgumentException("Vous n'appartenez à aucune équipe.");
    }

    teamMembershipTransitionService.detachMemberFromCurrentTeam(member);
    Member refreshedMember = currentMemberResolver.resolve(member);
    return createJwtToken(refreshedMember != null ? refreshedMember : member, true);
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
}
