package be.vinci.ipl.cae.demo;

import be.vinci.ipl.cae.demo.models.entities.Admin;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Responsible;
import be.vinci.ipl.cae.demo.models.entities.Specialty;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.TeamTournamentRegistration;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentMatch;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import be.vinci.ipl.cae.demo.repositories.AdminRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.ResponsibleRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialtyRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.TeamTournamentRegistrationRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentMatchRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import io.github.cdimascio.dotenv.Dotenv;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Main class of the application.
 */
@SuppressWarnings("PMD.UseUtilityClass")
@SpringBootApplication
public class DemoApplication {

  /**
   * Main method of the application.
   *
   * @param args t he arguments
   */
  public static void main(String[] args) {
    System.out.println("--- START LOAD .ENV FILE ---");
    Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
    // show all env values
    dotenv.entries().forEach(entry -> {
      if (entry.getKey().startsWith("APP_")) {
        System.out.println("VAR DETECTED : " + entry.getKey() + " = "
            + entry.getValue());
        // INJECT VAR IN SYSTEM PROPERTY FOR application.properties
        System.setProperty(entry.getKey(), entry.getValue());
      }
    });
    System.out.println("--- END LOAD .ENV FILE ---");
    SpringApplication.run(DemoApplication.class, args);
  }


  /**
   * Seeds demo accounts and teams used during the client demo.
   */
  @Bean
  @Order(2)
  @ConditionalOnProperty(name = "app.demo.seed.enabled", havingValue = "true")
  CommandLineRunner demoDataSeeder(
      MemberRepository memberRepository,
      ResponsibleRepository responsibleRepository,
      SpecialtyRepository specialtyRepository,
      TeamRepository teamRepository,
      AdminRepository adminRepository,
      TournamentRepository tournamentRepository,
      TournamentMatchRepository tournamentMatchRepository,
      TeamTournamentRegistrationRepository teamTournamentRegistrationRepository,
      BCryptPasswordEncoder passwordEncoder) {
    return args -> {
      final Member lea = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          "lea@mail.com",
          "Lynx",
          "lea123",
          "TACTICIAN",
          "Avatar1.png",
          LocalDate.of(2025, 11, 12).atStartOfDay(),
          Member.Role.ADMIN);

      final Member tom = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          "tom@mail.com",
          "Rogue",
          "tom123",
          "EXECUTOR",
          "Avatar2.png",
          LocalDate.of(2025, 12, 3).atStartOfDay(),
          Member.Role.MEMBER);

      final Member ines = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          "ines@mail.com",
          "Pulse",
          "ines123",
          "HEALER",
          "Avatar3.png",
          LocalDate.of(2026, 1, 18).atStartOfDay(),
          Member.Role.MEMBER);

      final Member pol = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          "pol@mail.com",
          "Wolf",
          "pol123",
          "ARCHITECT",
          "Avatar9.png",
          LocalDate.of(2026, 2, 2).atStartOfDay(),
          Member.Role.MEMBER);

      final Member tibo = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          "tibo@mail.com",
          "Iron",
          "tibo123",
          "GUARDIAN",
          "Avatar4.png",
          LocalDate.of(2025, 10, 27).atStartOfDay(),
          Member.Role.ADMIN);

      final Member neo = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          "neo@mail.com",
          "Shade",
          "neo123",
          "CATALYST",
          "Avatar10.png",
          LocalDate.of(2025, 10, 30).atStartOfDay(),
          Member.Role.MEMBER);

      final Member lisa = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          "lisa@mail.com",
          "Storm",
          "lisa123",
          "EXECUTOR",
          "Avatar5.png",
          LocalDate.of(2026, 1, 10).atStartOfDay(),
          Member.Role.RESPONSIBLE);

      final Member noa = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          "noa@mail.com",
          "Flash",
          "noa123",
          "ARCHITECT",
          "Avatar6.png",
          LocalDate.of(2026, 2, 2).atStartOfDay(),
          Member.Role.RESPONSIBLE);

      final Member tim = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          "tim@mail.com",
          "Titi",
          "tim123",
          "GUARDIAN",
          "Avatar7.png",
          LocalDate.of(2026, 2, 3).atStartOfDay(),
          Member.Role.MEMBER);

      final Member zoe = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          "zoe@mail.com",
          "Vector",
          "zoe123",
          "CATALYST",
          "Avatar8.png",
          LocalDate.of(2026, 2, 4).atStartOfDay(),
          Member.Role.MEMBER);

      final Member max = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          "max@mail.com",
          "Iron",
          "max123",
          "GUARDIAN",
          "Avatar11.png",
          LocalDate.of(2026, 3, 12).atStartOfDay(),
          Member.Role.RESPONSIBLE);

      final Member ali = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          "ali@mail.com",
          "Putsh",
          "ali123",
          "DISRUPTOR",
          "Avatar12.png",
          LocalDate.of(2026, 1, 22).atStartOfDay(),
          Member.Role.MEMBER);

      final Member zed = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          "zed@mail.com",
          "Zero",
          "zed123",
          "ARCHITECT",
          "Avatar13.png",
          LocalDate.of(2025, 12, 11).atStartOfDay(),
          Member.Role.ADMIN);

      final Member seb = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          "seb@mail.com",
          "Ice",
          "seb123",
          "HEALER",
          "Avatar14.png",
          LocalDate.of(2026, 3, 1).atStartOfDay(),
          Member.Role.ADMIN);

      final Member oli = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          "oli@mail.com",
          "Tiger",
          "oli123",
          "TACTICIAN",
          "Avatar15.png",
          LocalDate.of(2025, 11, 11).atStartOfDay(),
          Member.Role.MEMBER);

      final Member fin = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          "fin@mail.com",
          "Final",
          "fin123",
          "EXECUTOR",
          "Avatar16.png",
          LocalDate.of(2025, 10, 22).atStartOfDay(),
          Member.Role.MEMBER);

      final Responsible leaResponsible =
          ensureResponsible(memberRepository, responsibleRepository, lea, Member.Role.ADMIN);
      final Responsible tiboResponsible =
          ensureResponsible(memberRepository, responsibleRepository, tibo, Member.Role.ADMIN);
      final Responsible lisaResponsible =
          ensureResponsible(memberRepository, responsibleRepository, lisa, Member.Role.RESPONSIBLE);
      final Responsible noaResponsible =
          ensureResponsible(memberRepository, responsibleRepository, noa, Member.Role.RESPONSIBLE);
      final Responsible maxResponsible =
          ensureResponsible(memberRepository, responsibleRepository, max, Member.Role.RESPONSIBLE);
      final Responsible sebResponsible =
          ensureResponsible(memberRepository, responsibleRepository, seb, Member.Role.ADMIN);

      final Admin leaAdmin = ensureAdmin(memberRepository, adminRepository, lea);
      final Admin tiboAdmin = ensureAdmin(memberRepository, adminRepository, tibo);
      ensureAdmin(memberRepository, adminRepository, zed);
      ensureAdmin(memberRepository, adminRepository, seb);

      lisaResponsible.setSecondResponsible(noa);
      responsibleRepository.save(lisaResponsible);

      maxResponsible.setSecondResponsible(seb);
      responsibleRepository.save(maxResponsible);

      final Team teamAlpha = ensureTeam(teamRepository, "TEAM_ALPHA", leaResponsible, null);
      final Team teamOmega = ensureTeam(teamRepository, "TEAM_OMEGA", tiboResponsible, null);
      final Team teamIota = ensureTeam(
          teamRepository,
          "TEAM_IOTA",
          lisaResponsible,
          noaResponsible);
      final Team teamDelta = ensureTeam(
          teamRepository,
          "TEAM_DELTA",
          maxResponsible,
          sebResponsible);

      assignTeam(memberRepository, lea, teamAlpha, Member.Role.ADMIN);
      assignTeam(memberRepository, tom, teamAlpha, Member.Role.MEMBER);
      assignTeam(memberRepository, ines, teamAlpha, Member.Role.MEMBER);
      assignTeam(memberRepository, pol, teamAlpha, Member.Role.MEMBER);
      assignTeam(memberRepository, tibo, teamOmega, Member.Role.ADMIN);
      assignTeam(memberRepository, neo, teamOmega, Member.Role.MEMBER);
      assignTeam(memberRepository, lisa, teamIota, Member.Role.RESPONSIBLE);
      assignTeam(memberRepository, noa, teamIota, Member.Role.RESPONSIBLE);
      assignTeam(memberRepository, tim, teamIota, Member.Role.MEMBER);
      assignTeam(memberRepository, zoe, teamIota, Member.Role.MEMBER);
      assignTeam(memberRepository, max, teamDelta, Member.Role.RESPONSIBLE);
      assignTeam(memberRepository, ali, teamDelta, Member.Role.MEMBER);
      assignTeam(memberRepository, zed, teamDelta, Member.Role.ADMIN);
      assignTeam(memberRepository, seb, teamDelta, Member.Role.ADMIN);
      assignTeam(memberRepository, oli, teamDelta, Member.Role.MEMBER);
      assignTeam(memberRepository, fin, teamDelta, Member.Role.MEMBER);

      final List<Team> allTeams = new ArrayList<>(
          List.of(teamAlpha, teamOmega, teamIota, teamDelta));
      final List<Team> supplementaryTeams = seedSupplementaryTeams(
          memberRepository,
          responsibleRepository,
          specialtyRepository,
          teamRepository,
          passwordEncoder);
      allTeams.addAll(supplementaryTeams);
      ensureTeamsHaveMinimumSize(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          supplementaryTeams,
          4);

      final Tournament springArenaCup2025 = ensureTournament(
          tournamentRepository,
          "Spring Arena Cup 2025",
          "Compétition printanière ouverte aux nouvelles teams émergentes",
          "TEAM_OMEGA",
          LocalDate.of(2025, 4, 15).atTime(10, 0),
          LocalDate.of(2025, 4, 25).atTime(18, 0),
          LocalDate.of(2025, 4, 10).atTime(23, 59),
          8,
          TournamentStatus.TERMINE,
          leaAdmin);

      final Tournament eliteChampionship2025 = ensureTournament(
          tournamentRepository,
          "Elite Championship 2025",
          "Compétition élite réservée aux meilleures teams",
          "TEAM_IOTA",
          LocalDate.of(2025, 5, 15).atTime(10, 0),
          LocalDate.of(2025, 5, 30).atTime(18, 0),
          LocalDate.of(2025, 5, 11).atTime(23, 59),
          8,
          TournamentStatus.TERMINE,
          tiboAdmin);

      final Tournament summerProLeague2025 = ensureTournament(
          tournamentRepository,
          "Summer Pro League 2025",
          "Tournoi estival de haut niveau avec les meilleures teams",
          "TEAM_ALPHA",
          LocalDate.of(2025, 7, 1).atTime(10, 0),
          LocalDate.of(2025, 7, 15).atTime(18, 0),
          LocalDate.of(2025, 6, 25).atTime(23, 59),
          16,
          TournamentStatus.TERMINE,
          leaAdmin);

      final Tournament vinciWinterClash2026 = ensureTournament(
          tournamentRepository,
          "Vinci Winter Clash 2026",
          "Tournoi hivernal réunissant des équipes semi-professionnelles",
          "TEAM_DELTA",
          LocalDate.of(2026, 1, 10).atTime(10, 0),
          LocalDate.of(2026, 1, 20).atTime(18, 0),
          LocalDate.of(2026, 1, 5).atTime(23, 59),
          12,
          TournamentStatus.TERMINE,
          tiboAdmin);

      final Tournament testQuarterFinal = ensureTournament(
          tournamentRepository,
          "Test Quart de finale",
          "Tournoi test avec 8 equipes (quart de finale)",
          "TEAM_ALPHA",
          LocalDate.of(2025, 2, 10).atTime(10, 0),
          LocalDate.of(2025, 2, 15).atTime(18, 0),
          LocalDate.of(2025, 2, 5).atTime(23, 59),
          8,
          TournamentStatus.TERMINE,
          leaAdmin);

      final Tournament testHuitiemeFinal = ensureTournament(
          tournamentRepository,
          "Test Huitieme",
          "Tournoi test avec 16 equipes (huitieme)",
          "TEAM_OMEGA",
          LocalDate.of(2025, 3, 1).atTime(10, 0),
          LocalDate.of(2025, 3, 6).atTime(18, 0),
          LocalDate.of(2025, 2, 24).atTime(23, 59),
          16,
          TournamentStatus.TERMINE,
          tiboAdmin);

      final Tournament testDemiFinal = ensureTournament(
          tournamentRepository,
          "Test Demi finale",
          "Tournoi test avec 4 equipes (demi-finale)",
          "TEAM_IOTA",
          LocalDate.of(2025, 1, 12).atTime(10, 0),
          LocalDate.of(2025, 1, 15).atTime(18, 0),
          LocalDate.of(2025, 1, 8).atTime(23, 59),
          4,
          TournamentStatus.TERMINE,
          leaAdmin);

      final Tournament springBattleSeries2026 = ensureTournament(
          tournamentRepository,
          "Spring Battle Series 2026",
          "Série printanière avec élimination directe et forte participation",
          null,
          LocalDate.of(2026, 5, 4).atTime(10, 0),
          LocalDate.of(2026, 5, 12).atTime(18, 0),
          LocalDate.of(2026, 5, 1).atTime(23, 59),
          8,
          TournamentStatus.INSCRIPTION,
          leaAdmin);

      final Tournament vinciEasterCup2026 = ensureTournament(
          tournamentRepository,
          "Vinci Easter Cup 2026",
          "Tournoi de Pâques ouvert à toutes les teams actives",
          "TEAM_DELTA",
          LocalDate.of(2026, 4, 15).atTime(10, 0),
          LocalDate.of(2026, 4, 25).atTime(18, 0),
          LocalDate.of(2026, 4, 8).atTime(23, 59),
          8,
          TournamentStatus.TERMINE,
          leaAdmin);

      final Tournament eliteChampionship2026 = ensureTournament(
          tournamentRepository,
          "Elite Championship 2026",
          "Compétition élite réservée aux meilleures teams",
          null,
          LocalDate.of(2026, 5, 16).atTime(10, 0),
          LocalDate.of(2026, 5, 30).atTime(18, 0),
          LocalDate.of(2026, 5, 13).atTime(23, 59),
          10,
          TournamentStatus.INSCRIPTION,
          tiboAdmin);

      final Tournament planningAccessDemo2026 = ensureTournament(
          tournamentRepository,
          "Planning Access Demo 2026",
          "Tournoi de test dont les inscriptions sont fermées avant le début",
          null,
          LocalDate.of(2026, 4, 30).atTime(10, 0),
          LocalDate.of(2026, 5, 3).atTime(18, 0),
          LocalDate.of(2026, 4, 20).atTime(23, 59),
          8,
          TournamentStatus.INSCRIPTION,
          leaAdmin);

      ensureRegistrations(
          teamTournamentRegistrationRepository,
          springArenaCup2025,
          firstTeams(allTeams, 7),
          LocalDate.of(2025, 4, 1).atTime(9, 0));
      ensureRegistrations(
          teamTournamentRegistrationRepository,
          eliteChampionship2025,
          firstTeams(allTeams, 6),
          LocalDate.of(2025, 5, 1).atTime(9, 0));
      ensureRegistrations(
          teamTournamentRegistrationRepository,
          summerProLeague2025,
          firstTeams(allTeams, 14),
          LocalDate.of(2025, 6, 10).atTime(9, 0));
      ensureRegistrations(
          teamTournamentRegistrationRepository,
          vinciWinterClash2026,
          firstTeams(allTeams, 12),
          LocalDate.of(2026, 1, 1).atTime(9, 0));
      ensureRegistrations(
          teamTournamentRegistrationRepository,
          testQuarterFinal,
          firstTeams(allTeams, 8),
          LocalDate.of(2025, 2, 1).atTime(9, 0));
      ensureRegistrations(
          teamTournamentRegistrationRepository,
          testHuitiemeFinal,
          firstTeams(allTeams, 16),
          LocalDate.of(2025, 2, 18).atTime(9, 0));
      ensureRegistrations(
          teamTournamentRegistrationRepository,
          testDemiFinal,
          firstTeams(allTeams, 4),
          LocalDate.of(2025, 1, 5).atTime(9, 0));
      ensureRegistrations(
          teamTournamentRegistrationRepository,
          springBattleSeries2026,
          firstTeams(allTeams, 8),
          LocalDate.of(2026, 4, 25).atTime(9, 0));
      if (LocalDateTime.now().isBefore(springBattleSeries2026.getRegistrationDeadline())) {
        tournamentMatchRepository.deleteByTournamentId(springBattleSeries2026.getId());
      }
      ensureRegistrations(
          teamTournamentRegistrationRepository,
          vinciEasterCup2026,
          firstTeamsExcluding(
              allTeams,
              List.of(teamAlpha.getId(), teamIota.getId()),
              7),
          LocalDate.of(2026, 4, 1).atTime(9, 0));
      ensureRegistrations(
          teamTournamentRegistrationRepository,
          eliteChampionship2026,
          firstTeamsExcluding(allTeams, List.of(teamDelta.getId()), 9),
          LocalDate.of(2026, 5, 2).atTime(9, 0));
      ensureRegistrations(
          teamTournamentRegistrationRepository,
          planningAccessDemo2026,
          firstTeams(allTeams, 8),
          LocalDate.of(2026, 4, 15).atTime(9, 0));

      List<Team> springArenaTeams = teamTournamentRegistrationRepository
          .findByTournamentIdOrderByRegistrationDateAsc(springArenaCup2025.getId())
          .stream()
          .map(TeamTournamentRegistration::getTeam)
          .toList();
      List<Team> eliteChampionshipTeams = teamTournamentRegistrationRepository
          .findByTournamentIdOrderByRegistrationDateAsc(eliteChampionship2025.getId())
          .stream()
          .map(TeamTournamentRegistration::getTeam)
          .toList();
      List<Team> summerProLeagueTeams = teamTournamentRegistrationRepository
          .findByTournamentIdOrderByRegistrationDateAsc(summerProLeague2025.getId())
          .stream()
          .map(TeamTournamentRegistration::getTeam)
          .toList();
      final List<Team> vinciWinterClashTeams = teamTournamentRegistrationRepository
          .findByTournamentIdOrderByRegistrationDateAsc(vinciWinterClash2026.getId())
          .stream()
          .map(TeamTournamentRegistration::getTeam)
          .toList();
      final List<Team> vinciEasterCupTeams = teamTournamentRegistrationRepository
          .findByTournamentIdOrderByRegistrationDateAsc(vinciEasterCup2026.getId())
          .stream()
          .map(TeamTournamentRegistration::getTeam)
          .toList();
      ensureBracketMatches(
          tournamentMatchRepository,
          springArenaCup2025,
          leaAdmin,
          springArenaTeams,
          resolveWinnerTeamId(teamRepository, springArenaCup2025.getWinnerTeamName()));
      ensureBracketMatches(
          tournamentMatchRepository,
          eliteChampionship2025,
          tiboAdmin,
          eliteChampionshipTeams,
          resolveWinnerTeamId(teamRepository, eliteChampionship2025.getWinnerTeamName()));
      ensureBracketMatches(
          tournamentMatchRepository,
          summerProLeague2025,
          leaAdmin,
          summerProLeagueTeams,
          resolveWinnerTeamId(teamRepository, summerProLeague2025.getWinnerTeamName()));
      ensureBracketMatches(
          tournamentMatchRepository,
          vinciWinterClash2026,
          tiboAdmin,
          vinciWinterClashTeams,
          resolveWinnerTeamId(teamRepository, vinciWinterClash2026.getWinnerTeamName()));
      ensureBracketMatches(
          tournamentMatchRepository,
          vinciEasterCup2026,
          leaAdmin,
          vinciEasterCupTeams,
          resolveWinnerTeamId(teamRepository, vinciEasterCup2026.getWinnerTeamName()));
      ensureBracketMatches(
          tournamentMatchRepository,
          testQuarterFinal,
          leaAdmin,
          teamTournamentRegistrationRepository
              .findByTournamentIdOrderByRegistrationDateAsc(testQuarterFinal.getId())
              .stream()
              .map(TeamTournamentRegistration::getTeam)
              .toList(),
          resolveWinnerTeamId(teamRepository, testQuarterFinal.getWinnerTeamName()));
      ensureBracketMatches(
          tournamentMatchRepository,
          testHuitiemeFinal,
          tiboAdmin,
          teamTournamentRegistrationRepository
              .findByTournamentIdOrderByRegistrationDateAsc(testHuitiemeFinal.getId())
              .stream()
              .map(TeamTournamentRegistration::getTeam)
              .toList(),
          resolveWinnerTeamId(teamRepository, testHuitiemeFinal.getWinnerTeamName()));
      ensureBracketMatches(
          tournamentMatchRepository,
          testDemiFinal,
          leaAdmin,
          teamTournamentRegistrationRepository
              .findByTournamentIdOrderByRegistrationDateAsc(testDemiFinal.getId())
              .stream()
              .map(TeamTournamentRegistration::getTeam)
              .toList(),
          resolveWinnerTeamId(teamRepository, testDemiFinal.getWinnerTeamName()));

    };
  }

  private static Member upsertMember(
      MemberRepository memberRepository,
      SpecialtyRepository specialtyRepository,
      BCryptPasswordEncoder passwordEncoder,
      String email,
      String tag,
      String rawPassword,
      String specialtyCode,
      String profileImage,
      LocalDateTime createdAt,
      Member.Role role) {
    Member member = memberRepository.findByEmail(email);
    if (member == null) {
      member = new Member();
      member.setCreatedAt(createdAt);
    }

    Specialty specialty = specialtyRepository.findByCode(specialtyCode)
        .orElseThrow(() -> new IllegalStateException("Specialite introuvable: " + specialtyCode));
    member.setEmail(email);
    member.setTag(tag);
    member.setPasswordHash(passwordEncoder.encode(rawPassword));
    member.setSpecialty(specialty);
    member.setProfileImage(profileImage);
    member.setRole(role);

    return memberRepository.save(member);
  }

  private static Responsible ensureResponsible(
      MemberRepository memberRepository,
      ResponsibleRepository responsibleRepository,
      Member member,
      Member.Role role) {
    Responsible responsible = member.getResponsible();
    if (responsible == null) {
      responsible = new Responsible();
      responsible.setMember(member);
      responsible = responsibleRepository.save(responsible);
      member.setResponsible(responsible);
    }

    member.setRole(role);
    Member savedMember = memberRepository.save(member);
    return savedMember.getResponsible();
  }

  private static Admin ensureAdmin(
      MemberRepository memberRepository,
      AdminRepository adminRepository,
      Member member) {
    Admin admin = member.getAdmin();
    if (admin == null) {
      admin = new Admin();
      admin.setId(member.getId());
    }

    admin.setMember(member);
    admin = adminRepository.save(admin);
    member.setAdmin(admin);
    member.setRole(Member.Role.ADMIN);
    memberRepository.save(member);
    return admin;
  }

  private static Team ensureTeam(
      TeamRepository teamRepository,
      String teamName,
      Responsible responsible,
      Responsible secondResponsible) {
    Team team = teamRepository.findByNom(teamName).orElseGet(Team::new);
    team.setNom(teamName);
    team.setResponsible(responsible);
    team.setSecondResponsible(secondResponsible);
    return teamRepository.save(team);
  }

  private static void assignTeam(
      MemberRepository memberRepository,
      Member member,
      Team team,
      Member.Role role) {
    member.setTeam(team);
    member.setRole(role);
    memberRepository.save(member);
  }

  private static List<Team> seedSupplementaryTeams(
      MemberRepository memberRepository,
      ResponsibleRepository responsibleRepository,
      SpecialtyRepository specialtyRepository,
      TeamRepository teamRepository,
      BCryptPasswordEncoder passwordEncoder) {
    String[][] seeds = {
      {
        "TEAM_BETA", "beta.lead@mail.com", "Quark", "beta123",
        "CATALYST", "Avatar9.png", "2025-09-01"
      },
      {
        "TEAM_GAMMA", "gamma.lead@mail.com", "Razer", "gamma123",
        "DISRUPTOR", "Avatar10.png", "2025-09-02"
      },
      {
        "TEAM_SIGMA", "sigma.lead@mail.com", "Flux", "sigma123",
        "EXECUTOR", "Avatar12.png", "2025-09-04"
      },
      {
        "TEAM_NOVA", "nova.lead@mail.com", "Astra", "nova123",
        "ARCHITECT", "Avatar13.png", "2025-09-05"
      },
      {
        "TEAM_ORION", "orion.lead@mail.com", "Orion", "orion123",
        "GUARDIAN", "Avatar14.png", "2025-09-06"
      },
      {
        "TEAM_PHOENIX", "phoenix.lead@mail.com", "Pyre", "phoenix123",
        "HEALER", "Avatar15.png", "2025-09-07"
      },
      {
        "TEAM_SOLAR", "solar.lead@mail.com", "Halo", "solar123",
        "CATALYST", "Avatar16.png", "2025-09-08"
      },
      {
        "TEAM_ECHO", "echo.lead@mail.com", "Echo", "echo123",
        "DISRUPTOR", "Avatar17.png", "2025-09-09"
      },
      {
        "TEAM_APEX", "apex.lead@mail.com", "Apex", "apex123",
        "TACTICIAN", "Avatar18.png", "2025-09-10"
      },
      {
        "TEAM_BLAZE", "blaze.lead@mail.com", "Blaze", "blaze123",
        "EXECUTOR", "Avatar19.png", "2025-09-11"
      },
      {
        "TEAM_VORTEX", "vortex.lead@mail.com", "Vortex", "vortex123",
        "TACTICIAN", "Avatar20.png", "2025-09-12"
      },
      {
        "TEAM_NEXUS", "nexus.lead@mail.com", "Nexus", "nexus123",
        "ARCHITECT", "Avatar21.png", "2025-09-13"
      }
    };

    List<Team> teams = new ArrayList<>();
    for (String[] seed : seeds) {
      Member leader = upsertMember(
          memberRepository,
          specialtyRepository,
          passwordEncoder,
          seed[1],
          seed[2],
          seed[3],
          seed[4],
          seed[5],
          LocalDate.parse(seed[6]).atStartOfDay(),
          Member.Role.RESPONSIBLE);

      Responsible responsible = ensureResponsible(
          memberRepository,
          responsibleRepository,
          leader,
          Member.Role.RESPONSIBLE);

      Team team = ensureTeam(teamRepository, seed[0], responsible, null);
      assignTeam(memberRepository, leader, team, Member.Role.RESPONSIBLE);
      teams.add(team);
    }

    return teams;
  }

  private static void ensureTeamsHaveMinimumSize(
      MemberRepository memberRepository,
      SpecialtyRepository specialtyRepository,
      BCryptPasswordEncoder passwordEncoder,
      List<Team> teams,
      int minimumSize) {
    String[] specialtyCodes = {
      "TACTICIAN", "EXECUTOR", "HEALER", "GUARDIAN", "ARCHITECT", "CATALYST", "DISRUPTOR"
    };

    for (Team team : teams) {
      int currentSize = memberRepository.findByTeamId(team.getId()).size();
      String teamSlug = team.getNom().toLowerCase(Locale.ROOT).replace("team_", "");

      for (int index = currentSize + 1; index <= minimumSize; index++) {
        String specialtyCode = specialtyCodes[(index - 1) % specialtyCodes.length];
        Member member = upsertMember(
            memberRepository,
            specialtyRepository,
            passwordEncoder,
            teamSlug + ".member" + index + "@mail.com",
            teamSlug + "_member" + index,
            teamSlug + "123",
            specialtyCode,
            "Avatar" + (((index - 1) % 19) + 1) + ".png",
            LocalDate.of(2026, 3, Math.min(28, index)).atStartOfDay(),
            Member.Role.MEMBER);
        assignTeam(memberRepository, member, team, Member.Role.MEMBER);
      }
    }
  }

  private static Tournament ensureTournament(
      TournamentRepository tournamentRepository,
      String name,
      String description,
      String winnerTeamName,
      LocalDateTime startDate,
      LocalDateTime endDate,
      LocalDateTime registrationDeadline,
      Integer maxTeams,
      TournamentStatus status,
      Admin administrator) {
    Tournament tournament = tournamentRepository.findAll().stream()
        .filter(existing -> name.equals(existing.getName()))
        .findFirst()
        .orElseGet(Tournament::new);

    tournament.setName(name);
    tournament.setDescription(description);
    tournament.setWinnerTeamName(winnerTeamName);
    tournament.setStartDate(startDate);
    tournament.setEndDate(endDate);
    tournament.setRegistrationDeadline(registrationDeadline);
    tournament.setMaxTeams(maxTeams);
    tournament.setStatus(status);
    tournament.setAdministrator(administrator);
    return tournamentRepository.save(tournament);
  }

  private static void ensureRegistrations(
      TeamTournamentRegistrationRepository teamTournamentRegistrationRepository,
      Tournament tournament,
      List<Team> teams,
      LocalDateTime firstRegistrationDate) {
    List<Long> desiredTeamIds = teams.stream()
        .map(Team::getId)
        .toList();

    List<TeamTournamentRegistration> existingRegistrations =
        teamTournamentRegistrationRepository.findByTournamentIdOrderByRegistrationDateAsc(
            tournament.getId());

    for (TeamTournamentRegistration registration : existingRegistrations) {
      if (!desiredTeamIds.contains(registration.getTeam().getId())) {
        teamTournamentRegistrationRepository.delete(registration);
      }
    }

    for (int index = 0; index < teams.size(); index++) {
      Team team = teams.get(index);
      if (teamTournamentRegistrationRepository.existsByTeamIdAndTournamentId(
          team.getId(),
          tournament.getId())) {
        continue;
      }

      TeamTournamentRegistration registration = new TeamTournamentRegistration();
      registration.setTournament(tournament);
      registration.setTeam(team);
      registration.setRegistrationDate(firstRegistrationDate.plusHours(index));
      registration.setEliminated(false);
      teamTournamentRegistrationRepository.save(registration);
    }
  }

  private static List<Team> firstTeams(List<Team> teams, int count) {
    if (count > teams.size()) {
      throw new IllegalArgumentException("Pas assez de teams seedées pour ce tournoi");
    }
    return List.copyOf(teams.subList(0, count));
  }

  private static List<Team> firstTeamsExcluding(
      List<Team> teams,
      List<Long> excludedTeamIds,
      int count) {
    List<Team> filteredTeams = teams.stream()
        .filter(team -> !excludedTeamIds.contains(team.getId()))
        .toList();

    if (count > filteredTeams.size()) {
      throw new IllegalArgumentException("Pas assez de teams seedées pour ce tournoi");
    }

    return List.copyOf(filteredTeams.subList(0, count));
  }

  private static void ensureBracketMatches(
      TournamentMatchRepository tournamentMatchRepository,
      Tournament tournament,
      Admin admin,
      List<Team> teams,
      Long winnerTeamId) {
    if (tournament == null || admin == null) {
      return;
    }
    List<TournamentMatch> existing =
        tournamentMatchRepository.findByTournamentIdOrderByScheduledDateAsc(tournament.getId());
    if (!existing.isEmpty()) {
      return;
    }
    if (teams.size() < 2) {
      return;
    }

    List<TournamentMatch> matches = new ArrayList<>();
    List<Team> currentRoundTeams = new ArrayList<>(teams);
    int roundIndex = 0;
    while (currentRoundTeams.size() >= 2) {
      TournamentMatch.Round round = roundForTeamCount(currentRoundTeams.size());
      List<Team> winners = new ArrayList<>();
      LocalDateTime roundStart = tournament.getStartDate()
          .plusDays(roundIndex)
          .withHour(14)
          .withMinute(0)
          .withSecond(0)
          .withNano(0);

      int i = 0;
      while (i < currentRoundTeams.size()) {
        Team teamA = currentRoundTeams.get(i);
        // Si impaire, le dernier passe automatiquement au tour suivant (bye)
        if (i + 1 >= currentRoundTeams.size()) {
          winners.add(teamA);
          i++;
          continue;
        }
        Team teamB = currentRoundTeams.get(i + 1);
        Team winner = pickWinner(teamA, teamB, winnerTeamId);
        LocalDateTime scheduledDate = roundStart.plusHours(i / 2 * 2L);
        matches.add(buildMatch(
            tournament,
            teamA,
            teamB,
            round,
            scheduledDate,
            admin,
            false,
            TournamentMatch.Status.COMPLETED));
        winners.add(winner);
        i += 2;
      }

      currentRoundTeams = winners;
      roundIndex++;
    }

    tournamentMatchRepository.saveAll(matches);
  }

  private static Team pickWinner(Team teamA, Team teamB, Long winnerTeamId) {
    if (winnerTeamId == null) {
      return teamA;
    }
    if (winnerTeamId.equals(teamA.getId())) {
      return teamA;
    }
    if (winnerTeamId.equals(teamB.getId())) {
      return teamB;
    }
    return teamA;
  }

  private static Long resolveWinnerTeamId(TeamRepository teamRepository, String winnerTeamName) {
    if (winnerTeamName == null || winnerTeamName.isBlank()) {
      return null;
    }
    Team winner = teamRepository.findByNom(winnerTeamName).orElse(null);
    return winner != null ? winner.getId() : null;
  }

  private static TournamentMatch.Round roundForTeamCount(int teamCount) {
    return switch (teamCount) {
      case 2 -> TournamentMatch.Round.FINAL;
      case 4 -> TournamentMatch.Round.SEMI_FINAL;
      case 8 -> TournamentMatch.Round.QUARTER_FINAL;
      case 16 -> TournamentMatch.Round.ROUND_OF_16;
      case 32 -> TournamentMatch.Round.ROUND_OF_32;
      case 64 -> TournamentMatch.Round.ROUND_OF_64;
      case 128 -> TournamentMatch.Round.ROUND_OF_128;
      default -> TournamentMatch.Round.PREMIER_TOUR;
    };
  }

  private static TournamentMatch buildMatch(
      Tournament tournament,
      Team teamA,
      Team teamB,
      TournamentMatch.Round round,
      LocalDateTime scheduledDate,
      Admin admin,
      boolean isBye,
      TournamentMatch.Status status) {
    TournamentMatch match = new TournamentMatch();
    match.setTournament(tournament);
    match.setTeamA(teamA);
    match.setTeamB(teamB);
    match.setRound(round);
    match.setScheduledDate(scheduledDate);
    match.setAdministrator(admin);
    match.setBye(isBye);
    match.setStatus(status);
    return match;
  }
}
