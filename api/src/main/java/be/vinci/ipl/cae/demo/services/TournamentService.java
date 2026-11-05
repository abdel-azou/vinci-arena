package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ForbiddenException;
import be.vinci.ipl.cae.demo.exceptions.NotFoundException;
import be.vinci.ipl.cae.demo.mappers.TournamentMapper;
import be.vinci.ipl.cae.demo.mappers.TournamentMatchMapper;
import be.vinci.ipl.cae.demo.models.dtos.CreateTournamentRequest;
import be.vinci.ipl.cae.demo.models.dtos.MemberDto;
import be.vinci.ipl.cae.demo.models.dtos.RespondToMatchResultRequest;
import be.vinci.ipl.cae.demo.models.dtos.TournamentDto;
import be.vinci.ipl.cae.demo.models.dtos.TournamentMatchDto;
import be.vinci.ipl.cae.demo.models.dtos.TournamentParticipantTeamDto;
import be.vinci.ipl.cae.demo.models.dtos.UpdateMatchResultRequest;
import be.vinci.ipl.cae.demo.models.dtos.UpdateMatchSelectionRequest;
import be.vinci.ipl.cae.demo.models.dtos.UpdateTournamentMatchRequest;
import be.vinci.ipl.cae.demo.models.entities.Admin;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.TeamTournamentRegistration;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentMatch;
import be.vinci.ipl.cae.demo.models.entities.TournamentMatchTeamSelection;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import be.vinci.ipl.cae.demo.repositories.AdminRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.MemberUnavailabilityRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationTypeRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.TeamTournamentRegistrationRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentMatchRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentMatchTeamSelectionRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

/**
 * Service class for managing tournaments in Vinci Arena.
 */
@Service
@Transactional
public class TournamentService {

  private final TournamentRepository tournamentRepository;
  private final AdminRepository adminRepository;
  private final MemberRepository memberRepository;
  private final TeamRepository teamRepository;
  private final TeamTournamentRegistrationRepository teamTournamentRegistrationRepository;
  private final TournamentMatchRepository tournamentMatchRepository;
  private final TournamentMatchTeamSelectionRepository tournamentMatchTeamSelectionRepository;
  private final MemberUnavailabilityRepository memberUnavailabilityRepository;
  private final NotificationRepository notificationRepository;
  private final NotificationTypeRepository notificationTypeRepository;
  private final CurrentMemberResolver currentMemberResolver;

  /**
   * Constructor for TournamentService.
   */
  public TournamentService(TournamentRepository tournamentRepository,
                           AdminRepository adminRepository,
                           MemberRepository memberRepository,
                           TeamRepository teamRepository,
                           TeamTournamentRegistrationRepository
                               teamTournamentRegistrationRepository,
                           TournamentMatchRepository tournamentMatchRepository,
                             TournamentMatchTeamSelectionRepository
                               tournamentMatchTeamSelectionRepository,
                             MemberUnavailabilityRepository memberUnavailabilityRepository,
                             NotificationRepository notificationRepository,
                             NotificationTypeRepository notificationTypeRepository,
                           CurrentMemberResolver currentMemberResolver) {
    this.tournamentRepository = tournamentRepository;
    this.adminRepository = adminRepository;
    this.memberRepository = memberRepository;
    this.teamRepository = teamRepository;
    this.teamTournamentRegistrationRepository = teamTournamentRegistrationRepository;
    this.tournamentMatchRepository = tournamentMatchRepository;
    this.tournamentMatchTeamSelectionRepository = tournamentMatchTeamSelectionRepository;
    this.memberUnavailabilityRepository = memberUnavailabilityRepository;
    this.notificationRepository = notificationRepository;
    this.notificationTypeRepository = notificationTypeRepository;
    this.currentMemberResolver = currentMemberResolver;
  }

  /**
   * Creates a new tournament.
   */
  public Tournament createTournament(CreateTournamentRequest request, Member currentMember) {
    Member current = currentMemberResolver.resolve(currentMember);

    if (current == null) {
      throw new NotFoundException("Membre introuvable");
    }

    if (current.getRole() != Member.Role.ADMIN) {
      throw new ForbiddenException("Seul un admin peut créer un tournoi");
    }

    validateTournamentRequest(request);
    if (tournamentRepository.existsByName(request.name())) {
      throw new ConflictException("Un tournoi avec ce nom existe déjà. Choisis un autre nom.");
    }

    Tournament tournament = new Tournament();
    applyTournamentRequest(tournament, request);
    tournament.setStatus(TournamentStatus.PREPARATION);
    tournament.setAdministrator(ensureAdmin(current));

    return tournamentRepository.save(tournament);
  }

  /** Updates a draft tournament for any authenticated admin. */
  public Tournament updateDraftTournament(
      Long tournamentId,
      CreateTournamentRequest request,
      Member currentMember) {
    resolveAdmin(currentMember, "Seul un admin peut modifier un brouillon");
    Tournament tournament = loadDraftOrThrow(tournamentId);

    validateTournamentRequest(request);
    if (tournamentRepository.existsByNameAndIdNot(request.name(), tournamentId)) {
      throw new ConflictException("Un tournoi avec ce nom existe déjà. Choisis un autre nom.");
    }
    applyTournamentRequest(tournament, request);

    return tournamentRepository.save(tournament);
  }

  /** Publishes a draft tournament for any authenticated admin. */
  public Tournament publishDraftTournament(Long tournamentId, Member currentMember) {
    resolveAdmin(currentMember, "Seul un admin peut publier un brouillon");
    Tournament tournament = loadDraftOrThrow(tournamentId);

    LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
    if (!tournament.getRegistrationDeadline().isAfter(now)) {
      throw new IllegalArgumentException(
          "La date limite d'inscription doit être dans le futur pour publier ce tournoi");
    }
    if (!tournament.getStartDate().isAfter(now)) {
      throw new IllegalArgumentException(
          "Le tournoi a déjà commencé et ne peut plus être publié");
    }

    tournament.setStatus(TournamentStatus.INSCRIPTION);
    return tournamentRepository.save(tournament);
  }

  /** Returns all tournaments ordered by start date for display. */
  public List<TournamentDto> getAllTournamentDtos() {
    return tournamentRepository.findAll(Sort.by(Sort.Direction.ASC, "startDate")).stream()
        .peek(this::synchronizeTournamentStatus)
        .filter(this::isPubliclyVisible)
        .map(this::toTournamentDto)
        .toList();
  }

  /** Returns a tournament for display. */
  public TournamentDto getTournamentDtoById(Long tournamentId) {
    Tournament tournament = loadTournamentOrThrow(tournamentId);
    synchronizeTournamentStatus(tournament);
    if (!isPubliclyVisible(tournament)) {
      throw new NotFoundException("Tournoi introuvable");
    }
    return toTournamentDto(tournament);
  }

  /** Returns all draft tournaments for authenticated admins. */
  public List<TournamentDto> getMyDraftTournamentDtos(Member currentMember) {
    Member current = currentMemberResolver.resolve(currentMember);

    if (current == null) {
      throw new NotFoundException("Membre introuvable");
    }

    if (current.getRole() != Member.Role.ADMIN) {
      throw new ForbiddenException("Seul un admin peut voir les brouillons");
    }

    return tournamentRepository
        .findByStatusOrderByStartDateAsc(TournamentStatus.PREPARATION)
        .stream()
        .map(this::toTournamentDto)
        .toList();
  }

  /** Registers the current member's team to a tournament. */
  public TeamTournamentRegistration registerMyTeamToTournament(
      Long tournamentId,
      Member currentMember) {
    Member current = currentMemberResolver.resolve(currentMember);

    if (current == null) {
      throw new NotFoundException("Membre introuvable");
    }

    Team team = current.getTeam();
    if (team == null) {
      throw new ForbiddenException("Vous n'appartenez à aucune équipe");
    }

    Long currentId = current.getId();
    boolean isMainResponsible =
        team.getResponsible() != null
            && team.getResponsible().getMember() != null
            && currentId.equals(team.getResponsible().getMember().getId());

    boolean isSecondResponsible =
        team.getSecondResponsible() != null
            && team.getSecondResponsible().getMember() != null
            && currentId.equals(team.getSecondResponsible().getMember().getId());

    if (!isMainResponsible && !isSecondResponsible) {
      throw new ForbiddenException(
          "Seuls les responsables de l'équipe peuvent l'inscrire");
    }

    long teamMemberCount = memberRepository.countByTeamId(team.getId());
    if (teamMemberCount < 4) {
      throw new BadRequestException(
          "Une équipe doit compter au moins 4 membres pour s'inscrire à un tournoi");
    }

    Tournament tournament = loadTournamentOrThrow(tournamentId);

    LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
    synchronizeTournamentStatus(tournament);
    if (tournament.getStatus() == TournamentStatus.PREPARATION) {
      throw new BadRequestException(
          "Les inscriptions ne sont pas ouvertes pour l'instant");
    }
    if (tournament.getStatus() != TournamentStatus.INSCRIPTION
        || now.isAfter(tournament.getRegistrationDeadline())) {
      throw new BadRequestException(
          "Les inscriptions sont closes pour ce tournoi");
    }

    if (teamTournamentRegistrationRepository.existsByTeamIdAndTournamentId(
        team.getId(), tournamentId)) {
      throw new ConflictException("Votre équipe est déjà inscrite à ce tournoi");
    }

    int registeredTeamsCount = teamTournamentRegistrationRepository
        .findByTournamentIdOrderByRegistrationDateAsc(tournamentId)
        .size();
    if (registeredTeamsCount >= tournament.getMaxTeams()) {
      throw new BadRequestException(
          "Le nombre maximum d'équipes pour ce tournoi est atteint");
    }

    TeamTournamentRegistration registration = new TeamTournamentRegistration();
    registration.setTeam(team);
    registration.setTournament(tournament);
    registration.setRegistrationDate(now);
    registration.setEliminated(false);

    return teamTournamentRegistrationRepository.save(registration);
  }

  /**
   * Generates the tournament planning (full bracket up to the final).
   */
  public List<TournamentMatchDto> generateTournamentMatches(
      Long tournamentId,
      Member currentMember) {
    final Member adminMember =
        resolveAdmin(currentMember, "Seul un admin peut générer le planning");
    Tournament tournament = loadTournamentOrThrow(tournamentId);
    synchronizeTournamentStatus(tournament);

    LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
    if (!now.isAfter(tournament.getRegistrationDeadline())) {
      throw new IllegalArgumentException(
          "La génération n'est possible qu'après la date limite d'inscription");
    }
    if (now.isAfter(tournament.getEndDate())) {
      throw new IllegalArgumentException("Le tournoi est déjà terminé");
    }
    if (tournament.getStatus() == TournamentStatus.PREPARATION) {
      throw new IllegalArgumentException("Le tournoi n'est pas publié");
    }

    List<TournamentMatch> existingMatches =
        tournamentMatchRepository.findByTournamentIdOrderByScheduledDateAsc(tournamentId);
    if (!existingMatches.isEmpty()) {
      throw new IllegalArgumentException("Le planning est déjà généré");
    }

    List<TeamTournamentRegistration> registrations =
        teamTournamentRegistrationRepository.findByTournamentIdOrderByRegistrationDateAsc(
            tournamentId);
    if (registrations.isEmpty()) {
      throw new IllegalArgumentException(
          "Tournoi annulé : aucun participant inscrit.");
    }
    if (registrations.size() == 1) {
      tournamentMatchRepository.deleteByTournamentId(tournamentId);
      Team winner = registrations.getFirst().getTeam();
      tournament.setWinnerTeamName(winner != null ? winner.getNom() : null);
      tournament.setStatus(TournamentStatus.TERMINE);
      tournamentRepository.save(tournament);
      return List.of();
    }

    tournamentMatchRepository.deleteByTournamentId(tournamentId);

    List<Team> teams = registrations.stream()
        .map(TeamTournamentRegistration::getTeam)
        .toList();
    List<Team> shuffledTeams = new ArrayList<>(teams);
    Collections.shuffle(shuffledTeams);

    int totalTeams = shuffledTeams.size();
    int bracketSize = 1;
    while (bracketSize < totalTeams) {
      bracketSize *= 2;
    }

    TournamentMatch.Round firstRound = roundForTeamCount(bracketSize);
    Admin admin = ensureAdmin(adminMember);
    LocalDateTime firstRoundStart = tournament.getStartDate().withSecond(0).withNano(0);

    int roundsToSchedule = Integer.numberOfTrailingZeros(bracketSize);
    long availableDays = ChronoUnit.DAYS.between(
        tournament.getStartDate().toLocalDate(),
        tournament.getEndDate().toLocalDate()) + 1;
    if (availableDays < roundsToSchedule) {
      throw new IllegalArgumentException(
          "Il n'y a pas assez de jours disponibles pour planifier tous les matchs du tournoi");
    }

    List<TournamentMatch> matches = new ArrayList<>();
    List<Team> advancingTeams = new ArrayList<>();
    int roundDayOffset = 0;

    int byeCount = bracketSize - totalTeams;
    Map<String, Integer> winCounts = computePastTournamentWins();
    List<Team> byeTeams = new ArrayList<>();
    for (int i = 0; i < byeCount; i++) {
      Team byeTeam = selectStrongestTeam(shuffledTeams, winCounts);
      if (byeTeam == null) {
        break;
      }
      shuffledTeams.remove(byeTeam);
      byeTeams.add(byeTeam);
    }

    for (Team byeTeam : byeTeams) {
      LocalDateTime scheduledDate = firstRoundStart.plusDays(roundDayOffset);
      matches.add(buildMatch(
          tournament,
          byeTeam,
          null,
          firstRound,
          scheduledDate,
          admin,
          true));
      advancingTeams.add(byeTeam);
    }

    Collections.shuffle(shuffledTeams);
    for (int i = 0; i < shuffledTeams.size(); i += 2) {
      Team teamA = shuffledTeams.get(i);
      Team teamB = shuffledTeams.get(i + 1);
      LocalDateTime scheduledDate = firstRoundStart.plusDays(roundDayOffset);
      matches.add(buildMatch(
          tournament,
          teamA,
          teamB,
          firstRound,
          scheduledDate,
          admin,
          false));
      advancingTeams.add(selectProjectedWinner(teamA, teamB));
    }

    roundDayOffset++;

    while (advancingTeams.size() > 1) {
      TournamentMatch.Round round = roundForTeamCount(advancingTeams.size());
      List<Team> nextRoundTeams = new ArrayList<>();

      for (int i = 0; i < advancingTeams.size(); i += 2) {
        Team teamA = advancingTeams.get(i);
        Team teamB = advancingTeams.get(i + 1);
        LocalDateTime scheduledDate = firstRoundStart.plusDays(roundDayOffset);
        matches.add(buildMatch(
            tournament,
            teamA,
            teamB,
            round,
            scheduledDate,
            admin,
            false));
        nextRoundTeams.add(selectProjectedWinner(teamA, teamB));
      }

      advancingTeams = nextRoundTeams;
      roundDayOffset++;
    }

    return tournamentMatchRepository.saveAll(matches).stream()
        .map(TournamentMatchMapper::toDto)
        .toList();
  }

  private Team selectProjectedWinner(Team teamA, Team teamB) {
    if (teamA == null) {
      return teamB;
    }
    if (teamB == null) {
      return teamA;
    }
    return Math.random() < 0.5 ? teamA : teamB;
  }

  /**
   * Returns the matches for a tournament.
   */
  public List<TournamentMatchDto> getTournamentMatches(Long tournamentId) {
    return getTournamentMatches(tournamentId, null);
  }

  /**
   * Returns the matches for a tournament, with selection visibility filtering.
   */
  public List<TournamentMatchDto> getTournamentMatches(Long tournamentId, Member currentMember) {
    return tournamentMatchRepository.findByTournamentIdOrderByScheduledDateAsc(tournamentId)
        .stream()
        .map(match -> toMatchDto(match, currentMember))
        .toList();
  }

  /**
   * Updates a match before publication.
   */
  public TournamentMatchDto updateTournamentMatch(
      Long tournamentId,
      Long matchId,
      UpdateTournamentMatchRequest request,
      Member currentMember) {
    resolveAdmin(currentMember, "Seul un admin peut modifier un match");

    TournamentMatch match = tournamentMatchRepository.findById(matchId)
        .orElseThrow(() -> new NotFoundException("Match introuvable"));
    if (match.getTournament() == null
        || !match.getTournament().getId().equals(tournamentId)) {
      throw new NotFoundException("Match introuvable");
    }
    if (match.getStatus() != TournamentMatch.Status.PLANNED) {
      throw new IllegalArgumentException("Le planning est déjà publié");
    }

    Tournament tournament = match.getTournament();
    LocalDateTime scheduledDate = request.scheduledDate();
    if (scheduledDate.isBefore(tournament.getStartDate())
        || scheduledDate.isAfter(tournament.getEndDate())) {
      throw new IllegalArgumentException(
          "La date du match doit être comprise dans la durée du tournoi");
    }

    List<TeamTournamentRegistration> registrations =
        teamTournamentRegistrationRepository.findByTournamentIdOrderByRegistrationDateAsc(
            tournamentId);
    Set<Long> registeredTeamIds = registrations.stream()
        .map(registration -> registration.getTeam().getId())
        .collect(Collectors.toSet());

    Team teamA = teamRepository.findById(request.teamAId())
        .orElseThrow(() -> new NotFoundException("Équipe introuvable"));
    if (!registeredTeamIds.contains(teamA.getId())) {
      throw new IllegalArgumentException("L'équipe doit être inscrite au tournoi");
    }

    Team teamB = null;
    if (request.teamBId() != null) {
      if (request.teamBId().equals(request.teamAId())) {
        throw new IllegalArgumentException("Les deux équipes doivent être différentes");
      }
      teamB = teamRepository.findById(request.teamBId())
          .orElseThrow(() -> new NotFoundException("Équipe introuvable"));
      if (!registeredTeamIds.contains(teamB.getId())) {
        throw new IllegalArgumentException("L'équipe doit être inscrite au tournoi");
      }
    }

    match.setTeamA(teamA);
    match.setTeamB(teamB);
    match.setScheduledDate(scheduledDate.withSecond(0).withNano(0));
    match.setBye(teamB == null);

    return toMatchDto(tournamentMatchRepository.save(match), currentMember);
  }

  /**
   * Updates one team player selection for a published match.
   */
  public TournamentMatchDto updateMatchSelection(
      Long tournamentId,
      Long matchId,
      UpdateMatchSelectionRequest request,
      Member currentMember) {
    Member current = currentMemberResolver.resolve(currentMember);
    if (current == null) {
      throw new NotFoundException("Membre introuvable");
    }
    if (current.getTeam() == null) {
      throw new ForbiddenException("Vous n'appartenez à aucune équipe");
    }

    TournamentMatch match = tournamentMatchRepository.findById(matchId)
        .orElseThrow(() -> new NotFoundException("Match introuvable"));
    if (match.getTournament() == null
        || !match.getTournament().getId().equals(tournamentId)) {
      throw new NotFoundException("Match introuvable");
    }
    if (match.getStatus() != TournamentMatch.Status.PUBLISHED) {
      throw new IllegalArgumentException(
          "La sélection est ouverte uniquement pour un match publié");
    }
    if (match.getScheduledDate() == null) {
      throw new IllegalArgumentException("La date du match n'est pas définie");
    }
    if (!LocalDateTime.now().isBefore(match.getScheduledDate())) {
      throw new IllegalArgumentException("La sélection n'est plus modifiable");
    }

    Team currentTeam = current.getTeam();
    boolean teamInMatch = (match.getTeamA() != null
        && Objects.equals(match.getTeamA().getId(), currentTeam.getId()))
        || (match.getTeamB() != null
        && Objects.equals(match.getTeamB().getId(), currentTeam.getId()));
    if (!teamInMatch) {
      throw new ForbiddenException(
          "Seul un responsable d'une équipe du match peut faire la sélection");
    }
    if (!isResponsibleForTeam(current, currentTeam)) {
      throw new ForbiddenException("Seul un responsable de l'équipe peut faire la sélection");
    }

    List<Long> playerIds = request.playerIds();
    if (playerIds == null || playerIds.isEmpty() || playerIds.size() > 4
        || new LinkedHashSet<>(playerIds).size() != playerIds.size()) {
      throw new IllegalArgumentException(
          "La sélection doit contenir entre 1 et 4 joueurs sans doublons");
    }

    Map<Long, Member> teamMembersById = memberRepository.findByTeamId(currentTeam.getId()).stream()
        .collect(Collectors.toMap(Member::getId, member -> member));
    List<Member> selectedPlayers = new ArrayList<>();

    LocalDate matchDate = match.getScheduledDate().toLocalDate();

    for (Long playerId : playerIds) {
      Member player = teamMembersById.get(playerId);
      if (player == null) {
        throw new IllegalArgumentException(
            "Les joueurs sélectionnés doivent appartenir à votre équipe");
      }

      List<be.vinci.ipl.cae.demo.models.entities.MemberUnavailability> unavailabilities =
          memberUnavailabilityRepository.findByMemberId(playerId);
      boolean isUnavailable = unavailabilities.stream()
          .anyMatch(unavailability ->
              !matchDate.isBefore(unavailability.getStartDate())
                  && !matchDate.isAfter(unavailability.getEndDate()));
      if (isUnavailable) {
        throw new IllegalArgumentException(
            "Le joueur " + player.getTag() + " est indisponible à la date du match");
      }

      selectedPlayers.add(player);
    }

    TournamentMatchTeamSelection selection =
        tournamentMatchTeamSelectionRepository.findByMatchIdAndTeamId(matchId, currentTeam.getId())
            .orElseGet(TournamentMatchTeamSelection::new);
    selection.setMatch(match);
    selection.setTeam(currentTeam);
    selection.setPlayers(new LinkedHashSet<>(selectedPlayers));
    tournamentMatchTeamSelectionRepository.save(selection);

    notifySelectedPlayers(selectedPlayers, match, currentTeam, current);

    return toMatchDto(match, current);
  }

  /**
   * Encodes a match result and notifies both teams' responsibles.
   */
  public TournamentMatchDto updateMatchResult(
      Long tournamentId,
      Long matchId,
      UpdateMatchResultRequest request,
      Member currentMember) {
    resolveAdmin(currentMember, "Seul un admin peut encoder le resultat");
    TournamentMatch match = loadMatchOrThrow(tournamentId, matchId);

    if (match.isBye() || match.getTeamA() == null || match.getTeamB() == null) {
      throw new IllegalArgumentException("Impossible d'encoder le resultat d'un bye");
    }
    if (match.getStatus() == TournamentMatch.Status.PLANNED) {
      throw new IllegalArgumentException("Le match doit etre publie avant d'encoder un resultat");
    }
    if (match.getScheduledDate() == null) {
      throw new IllegalArgumentException("La date du match n'est pas definie");
    }
    if (LocalDateTime.now().isBefore(match.getScheduledDate())) {
      throw new IllegalArgumentException(
          "Le resultat ne peut etre encode qu'apres la date du match");
    }

    match.setTeamAlphaScore(request.teamAlphaScore());
    match.setTeamBravoScore(request.teamBravoScore());
    match.setResultStatus(TournamentMatch.ResultStatus.PENDING_CONFIRMATION);
    match.setTeamAlphaResultResponse(TournamentMatch.TeamResultResponse.PENDING);
    match.setTeamBravoResultResponse(TournamentMatch.TeamResultResponse.PENDING);
    match.setStatus(TournamentMatch.Status.PUBLISHED);

    TournamentMatch savedMatch = tournamentMatchRepository.save(match);
    notifyResultPendingConfirmation(savedMatch, null);
    return toMatchDto(savedMatch, currentMember);
  }

  /**
   * Receives one team's response to the encoded result.
   */
  public TournamentMatchDto respondToMatchResult(
      Long tournamentId,
      Long matchId,
      RespondToMatchResultRequest request,
      Member currentMember) {
    Member current = currentMemberResolver.resolve(currentMember);
    if (current == null) {
      throw new NotFoundException("Membre introuvable");
    }
    if (current.getTeam() == null) {
      throw new ForbiddenException("Vous n'appartenez a aucune equipe");
    }

    TournamentMatch match = loadMatchOrThrow(tournamentId, matchId);
    if (match.getTeamA() == null || match.getTeamB() == null) {
      throw new IllegalArgumentException("Aucun resultat a confirmer pour ce match");
    }
    if (match.getResultStatus() == TournamentMatch.ResultStatus.NOT_ENCODED) {
      throw new IllegalArgumentException("Aucun resultat n'a encore ete encode");
    }

    Team team = current.getTeam();
    boolean isTeamA = Objects.equals(match.getTeamA().getId(), team.getId());
    boolean isTeamB = Objects.equals(match.getTeamB().getId(), team.getId());
    if ((!isTeamA && !isTeamB) || !isResponsibleForTeam(current, team)) {
      throw new ForbiddenException(
          "Seul un responsable d'une equipe du match peut repondre au resultat");
    }

    String action =
        request.action() == null ? "" : request.action().trim().toUpperCase(Locale.ROOT);
    switch (action) {
      case "CONFIRM" -> applyResultConfirmation(match, isTeamA);
      case "CORRECT" -> applyResultCorrection(match, isTeamA, request);
      case "REFUSE" -> applyResultRefusal(match, isTeamA);
      default -> throw new IllegalArgumentException("Action de resultat invalide");
    }

    TournamentMatch savedMatch = tournamentMatchRepository.save(match);
    notifyResultResponse(savedMatch, team, action, current);
    return toMatchDto(savedMatch, currentMember);
  }

  /**
   * Declares a forfeit for the current member's team before the match date.
   */
  public TournamentMatchDto declareMatchForfeit(
      Long tournamentId,
      Long matchId,
      Member currentMember) {
    Member current = currentMemberResolver.resolve(currentMember);
    if (current == null) {
      throw new NotFoundException("Membre introuvable");
    }
    if (current.getTeam() == null) {
      throw new ForbiddenException("Vous n'appartenez a aucune equipe");
    }

    TournamentMatch match = loadMatchOrThrow(tournamentId, matchId);
    if (match.isBye() || match.getTeamA() == null || match.getTeamB() == null) {
      throw new IllegalArgumentException("Impossible de declarer forfait pour ce match");
    }
    if (match.getStatus() != TournamentMatch.Status.PUBLISHED) {
      throw new IllegalArgumentException(
          "Le forfait est possible uniquement pour un match publie");
    }
    if (match.getScheduledDate() == null) {
      throw new IllegalArgumentException("La date du match n'est pas definie");
    }
    if (!LocalDateTime.now().isBefore(match.getScheduledDate())) {
      throw new IllegalArgumentException("Le forfait doit etre declare avant la date du match");
    }

    Team team = current.getTeam();
    boolean isTeamA = Objects.equals(match.getTeamA().getId(), team.getId());
    boolean isTeamB = Objects.equals(match.getTeamB().getId(), team.getId());
    if ((!isTeamA && !isTeamB) || !isResponsibleForTeam(current, team)) {
      throw new ForbiddenException(
          "Seul un responsable d'une equipe du match peut declarer forfait");
    }

    if (isTeamA) {
      match.setTeamAlphaScore(0);
      match.setTeamBravoScore(5);
    } else {
      match.setTeamAlphaScore(5);
      match.setTeamBravoScore(0);
    }
    match.setResultStatus(TournamentMatch.ResultStatus.CONFIRMED);
    match.setTeamAlphaResultResponse(TournamentMatch.TeamResultResponse.CONFIRMED);
    match.setTeamBravoResultResponse(TournamentMatch.TeamResultResponse.CONFIRMED);
    match.setStatus(TournamentMatch.Status.COMPLETED);

    TournamentMatch savedMatch = tournamentMatchRepository.save(match);
    return toMatchDto(savedMatch, currentMember);
  }

  /**
   * Publishes the matches for a tournament.
   */
  public void publishTournamentMatches(Long tournamentId, Member currentMember) {
    resolveAdmin(currentMember, "Seul un admin peut publier le planning");

    List<TournamentMatch> matches =
        tournamentMatchRepository.findByTournamentIdOrderByScheduledDateAsc(tournamentId);
    if (matches.isEmpty()) {
      throw new NotFoundException("Aucun match à publier");
    }
    boolean alreadyPublished = matches.stream()
        .anyMatch(match -> match.getStatus() != TournamentMatch.Status.PLANNED);
    if (alreadyPublished) {
      throw new IllegalArgumentException("Le planning est déjà publié");
    }
    boolean missingSchedule = matches.stream()
        .anyMatch(match -> match.getScheduledDate() == null);
    if (missingSchedule) {
      throw new IllegalArgumentException("Tous les matchs doivent avoir une date planifiée");
    }

    matches.forEach(match -> match.setStatus(TournamentMatch.Status.PUBLISHED));
    tournamentMatchRepository.saveAll(matches);
    NotificationType notificationType = getOrCreateNotificationType("Prochain match");
    Member publisher = resolveAdmin(currentMember, null);
    matches.forEach(match -> notifyPublishedMatch(match, notificationType, publisher));
  }

  private TournamentMatchDto toMatchDto(TournamentMatch match, Member currentMember) {
    Member current = currentMember != null ? currentMemberResolver.resolve(currentMember) : null;

    Long viewerTeamId =
        current != null && current.getTeam() != null ? current.getTeam().getId() : null;
    boolean canViewAllBeforeMatch = current != null && current.getRole() == Member.Role.ADMIN;
    boolean isCompleted = match.getStatus() == TournamentMatch.Status.COMPLETED;

    List<MemberDto> selectionForTeamA = mapSelectionToMemberDtos(match, match.getTeamA());
    List<MemberDto> selectionForTeamB = mapSelectionToMemberDtos(match, match.getTeamB());

    if (!isCompleted && !canViewAllBeforeMatch) {
      if (match.getTeamA() == null || !Objects.equals(match.getTeamA().getId(), viewerTeamId)) {
        selectionForTeamA = List.of();
      }
      if (match.getTeamB() == null || !Objects.equals(match.getTeamB().getId(), viewerTeamId)) {
        selectionForTeamB = List.of();
      }
    }

    return TournamentMatchMapper.toDto(match, selectionForTeamA, selectionForTeamB);
  }

  private List<MemberDto> mapSelectionToMemberDtos(TournamentMatch match, Team team) {
    if (team == null) {
      return List.of();
    }

    return tournamentMatchTeamSelectionRepository
        .findByMatchIdAndTeamId(match.getId(), team.getId())
        .map(TournamentMatchTeamSelection::getPlayers)
        .orElseGet(Set::of)
        .stream()
        .sorted((a, b) -> a.getTag().compareToIgnoreCase(b.getTag()))
        .map(player -> new MemberDto(
            player.getId(),
            player.getTag(),
            player.getSpecialty() != null ? player.getSpecialty().getCode() : null,
            player.getRole()))
        .toList();
  }

  private boolean isResponsibleForTeam(Member current, Team team) {
    Long currentId = current.getId();
    boolean isMainResponsible =
        team.getResponsible() != null
            && team.getResponsible().getMember() != null
            && Objects.equals(team.getResponsible().getMember().getId(), currentId);
    boolean isSecondResponsible =
        team.getSecondResponsible() != null
            && team.getSecondResponsible().getMember() != null
            && Objects.equals(team.getSecondResponsible().getMember().getId(), currentId);
    return isMainResponsible || isSecondResponsible;
  }

  private NotificationType getOrCreateNotificationType(String name) {
    return notificationTypeRepository.findByName(name)
        .orElseGet(() -> {
          NotificationType notificationType = new NotificationType();
          notificationType.setName(name);
          return notificationTypeRepository.save(notificationType);
        });
  }

  private void notifyPublishedMatch(
      TournamentMatch match,
      NotificationType notificationType,
      Member excludeMember) {
    notifyTeamResponsibles(
        match, match.getTeamA(), match.getTeamB(), notificationType, excludeMember);
    notifyTeamResponsibles(
        match, match.getTeamB(), match.getTeamA(), notificationType, excludeMember);
  }

  private void notifyTeamResponsibles(
      TournamentMatch match,
      Team team,
      Team opponent,
      NotificationType notificationType,
      Member excludeMember) {
    if (team == null) {
      return;
    }

    List<Member> recipients = new ArrayList<>();
    if (team.getResponsible() != null
        && team.getResponsible().getMember() != null) {
      recipients.add(team.getResponsible().getMember());
    }
    if (team.getSecondResponsible() != null
        && team.getSecondResponsible().getMember() != null) {
      recipients.add(team.getSecondResponsible().getMember());
    }

    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    String dateText = match.getScheduledDate() != null
        ? match.getScheduledDate().format(formatter)
        : "date à confirmer";
    String message = opponent != null
        ? "Votre prochain match est contre " + opponent.getNom() + " le " + dateText
        : "Votre équipe est exemptée (bye) pour le match #" + match.getId();
    String link = "/tournaments/" + match.getTournament().getId()
        + "?section=planning&matchId=" + match.getId();

    Long excludeMemberId = excludeMember != null ? excludeMember.getId() : null;
    recipients.stream()
        .filter(Objects::nonNull)
        .filter(recipient -> excludeMemberId == null
            || !Objects.equals(recipient.getId(), excludeMemberId))
        .collect(Collectors.toMap(Member::getId, member -> member, (a, b) -> a))
        .values()
        .forEach(recipient -> {
          Notification notification = new Notification();
          notification.setMessage(message);
          notification.setRedirectLink(link);
          notification.setSender(recipient);
          notification.setNotificationType(notificationType);
          notificationRepository.save(notification);
        });
  }

  private void notifySelectedPlayers(
      List<Member> selectedPlayers,
      TournamentMatch match,
      Team team,
      Member selector) {
    if (selectedPlayers == null || selectedPlayers.isEmpty()) {
      return;
    }

    NotificationType notificationType = getOrCreateNotificationType("Sélection match");

    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    String dateText = match.getScheduledDate() != null
        ? match.getScheduledDate().format(formatter)
        : "date à confirmer";
    String opponentName = team.getId().equals(match.getTeamA().getId())
        && match.getTeamB() != null ? match.getTeamB().getNom()
        : match.getTeamA() != null ? match.getTeamA().getNom()
            : "adversaire à déterminer";
    String message = "Vous êtes sélectionné pour le match de votre équipe contre "
        + opponentName + " le " + dateText;
    String link = "/tournaments/" + match.getTournament().getId()
        + "?section=planning&matchId=" + match.getId();

    Long selectorId = selector != null ? selector.getId() : null;
    selectedPlayers.stream()
        .filter(Objects::nonNull)
        .filter(player -> selectorId == null || !Objects.equals(player.getId(), selectorId))
        .forEach(player -> {
          Notification notification = new Notification();
          notification.setMessage(message);
          notification.setRedirectLink(link);
          notification.setSender(player);
          notification.setNotificationType(notificationType);
          notificationRepository.save(notification);
        });
  }

  private Tournament loadTournamentOrThrow(Long tournamentId) {
    return tournamentRepository.findById(tournamentId)
      .orElseThrow(() -> new NotFoundException("Tournoi introuvable"));
  }

  private Member resolveAdmin(Member currentMember, String notAdminMessage) {
    Member current = currentMemberResolver.resolve(currentMember);

    if (current == null) {
      throw new NotFoundException("Membre introuvable");
    }

    if (current.getRole() != Member.Role.ADMIN) {
      throw new ForbiddenException(notAdminMessage);
    }

    return current;
  }

  private Tournament loadDraftOrThrow(Long tournamentId) {
    Tournament tournament = loadTournamentOrThrow(tournamentId);

    if (tournament.getStatus() != TournamentStatus.PREPARATION) {
      throw new IllegalArgumentException(
          "Seuls les tournois en brouillon peuvent être modifiés ou publiés");
    }

    return tournament;
  }

  private void validateTournamentRequest(CreateTournamentRequest request) {
    if (request.maxTeams() == null || request.maxTeams() <= 0) {
      throw new IllegalArgumentException(
          "Le nombre maximum d'équipes doit être supérieur à 0");
    }

    LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
    if (request.registrationDeadline().isBefore(now)) {
      throw new IllegalArgumentException(
          "La date limite d'inscription ne peut pas être dans le passé");
    }

    if (request.startDate().isBefore(now)) {
      throw new IllegalArgumentException(
          "La date de début ne peut pas être dans le passé");
    }

    if (request.endDate().isBefore(now)) {
      throw new IllegalArgumentException(
          "La date de fin ne peut pas être dans le passé");
    }

    if (!request.registrationDeadline().isBefore(request.startDate())) {
      throw new IllegalArgumentException(
          "La date limite d'inscription doit être avant la date de début du tournoi");
    }

    if (!request.endDate().isAfter(request.startDate())) {
      throw new IllegalArgumentException(
          "La date de fin doit être après la date de début");
    }
  }

  private void applyTournamentRequest(Tournament tournament, CreateTournamentRequest request) {
    tournament.setName(request.name());
    tournament.setDescription(request.description());
    tournament.setStartDate(request.startDate());
    tournament.setEndDate(request.endDate());
    tournament.setRegistrationDeadline(request.registrationDeadline());
    tournament.setMaxTeams(request.maxTeams());
  }

  private TournamentDto toTournamentDto(Tournament tournament) {
    List<TeamTournamentRegistration> registrations = teamTournamentRegistrationRepository
        .findByTournamentIdOrderByRegistrationDateAsc(tournament.getId());
    synchronizeTournamentStatus(tournament);
    List<String> registeredTeamNames = registrations.stream()
        .map(registration -> registration.getTeam().getNom())
        .toList();
    List<TournamentParticipantTeamDto> participantTeams = registrations.stream()
        .map(TeamTournamentRegistration::getTeam)
        .map(team -> new TournamentParticipantTeamDto(
            team.getId(),
            team.getNom(),
            memberRepository.findByTeamId(team.getId()).stream()
                .map(Member::getTag)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList()))
        .toList();
    return TournamentMapper.toDto(tournament, registeredTeamNames, participantTeams);
  }

  private boolean isPubliclyVisible(Tournament tournament) {
    return tournament.getStatus() != TournamentStatus.PREPARATION;
  }

  private void synchronizeTournamentStatus(Tournament tournament) {
    if (tournament.getStatus() == TournamentStatus.PREPARATION) {
      return;
    }
    LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
    if (now.isAfter(tournament.getEndDate())) {
      tournament.setStatus(TournamentStatus.TERMINE);
      return;
    }
    if (!now.isBefore(tournament.getStartDate())) {
      tournament.setStatus(TournamentStatus.EN_COURS);
      return;
    }
    tournament.setStatus(TournamentStatus.INSCRIPTION);
  }

  /**
   * Returns all tournaments ordered by start date.
   */
  public List<Tournament> getAllTournaments() {
    return tournamentRepository.findAll(Sort.by(Sort.Direction.ASC, "startDate"));
  }

  private Admin ensureAdmin(Member member) {
    if (member.getAdmin() != null) {
      return member.getAdmin();
    }

    Admin admin = new Admin();
    admin.setId(member.getId());
    admin.setMember(member);
    member.setAdmin(admin);
    return adminRepository.save(admin);
  }

  private TournamentMatch buildMatch(
      Tournament tournament,
      Team teamA,
      Team teamB,
      TournamentMatch.Round round,
      LocalDateTime scheduledDate,
      Admin admin,
      boolean isBye) {
    TournamentMatch match = new TournamentMatch();
    match.setTournament(tournament);
    match.setTeamA(teamA);
    match.setTeamB(teamB);
    match.setRound(round);
    match.setScheduledDate(
        scheduledDate == null ? null : scheduledDate.withSecond(0).withNano(0));
    match.setAdministrator(admin);
    match.setBye(isBye);
    match.setStatus(TournamentMatch.Status.PLANNED);
    match.setResultStatus(TournamentMatch.ResultStatus.NOT_ENCODED);
    match.setTeamAlphaResultResponse(TournamentMatch.TeamResultResponse.PENDING);
    match.setTeamBravoResultResponse(TournamentMatch.TeamResultResponse.PENDING);
    return match;
  }

  private TournamentMatch.Round roundForTeamCount(int teamCount) {
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

  private Map<String, Integer> computePastTournamentWins() {
    List<Tournament> pastTournaments =
        tournamentRepository.findByStatusOrderByStartDateAsc(TournamentStatus.TERMINE);
    Map<String, Integer> winCounts = new HashMap<>();
    for (Tournament past : pastTournaments) {
      String winnerName = past.getWinnerTeamName();
      if (winnerName != null && !winnerName.isBlank()) {
        winCounts.merge(winnerName, 1, Integer::sum);
      }
    }
    return winCounts;
  }

  private Team selectStrongestTeam(List<Team> teams, Map<String, Integer> winCounts) {
    if (teams.isEmpty()) {
      return null;
    }
    int maxWins = teams.stream()
        .mapToInt(team -> winCounts.getOrDefault(team.getNom(), 0))
        .max()
        .orElse(0);
    List<Team> strongest = teams.stream()
        .filter(team -> winCounts.getOrDefault(team.getNom(), 0) == maxWins)
        .toList();
    List<Team> shuffled = new ArrayList<>(strongest);
    Collections.shuffle(shuffled);
    return shuffled.getFirst();
  }

  private TournamentMatch loadMatchOrThrow(Long tournamentId, Long matchId) {
    TournamentMatch match = tournamentMatchRepository.findById(matchId)
        .orElseThrow(() -> new NotFoundException("Match introuvable"));
    if (match.getTournament() == null
        || !Objects.equals(match.getTournament().getId(), tournamentId)) {
      throw new NotFoundException("Match introuvable");
    }
    return match;
  }

  private void applyResultConfirmation(TournamentMatch match, boolean isTeamA) {
    if (isTeamA) {
      match.setTeamAlphaResultResponse(TournamentMatch.TeamResultResponse.CONFIRMED);
    } else {
      match.setTeamBravoResultResponse(TournamentMatch.TeamResultResponse.CONFIRMED);
    }

    if (match.getTeamAlphaResultResponse() == TournamentMatch.TeamResultResponse.CONFIRMED
        && match.getTeamBravoResultResponse() == TournamentMatch.TeamResultResponse.CONFIRMED) {
      match.setResultStatus(TournamentMatch.ResultStatus.CONFIRMED);
      match.setStatus(TournamentMatch.Status.COMPLETED);
    } else {
      match.setResultStatus(TournamentMatch.ResultStatus.PENDING_CONFIRMATION);
      match.setStatus(TournamentMatch.Status.PUBLISHED);
    }
  }

  private void applyResultCorrection(
      TournamentMatch match,
      boolean isTeamA,
      RespondToMatchResultRequest request) {
    if (request.teamAlphaScore() == null || request.teamBravoScore() == null) {
      throw new IllegalArgumentException(
          "Une correction doit contenir les scores des deux equipes");
    }

    match.setTeamAlphaScore(request.teamAlphaScore());
    match.setTeamBravoScore(request.teamBravoScore());
    match.setResultStatus(TournamentMatch.ResultStatus.PENDING_CONFIRMATION);
    match.setStatus(TournamentMatch.Status.PUBLISHED);
    if (isTeamA) {
      match.setTeamAlphaResultResponse(TournamentMatch.TeamResultResponse.CORRECTED);
      match.setTeamBravoResultResponse(TournamentMatch.TeamResultResponse.PENDING);
    } else {
      match.setTeamBravoResultResponse(TournamentMatch.TeamResultResponse.CORRECTED);
      match.setTeamAlphaResultResponse(TournamentMatch.TeamResultResponse.PENDING);
    }
  }

  private void applyResultRefusal(TournamentMatch match, boolean isTeamA) {
    match.setResultStatus(TournamentMatch.ResultStatus.DISPUTED);
    match.setStatus(TournamentMatch.Status.PUBLISHED);
    if (isTeamA) {
      match.setTeamAlphaResultResponse(TournamentMatch.TeamResultResponse.REFUSED);
    } else {
      match.setTeamBravoResultResponse(TournamentMatch.TeamResultResponse.REFUSED);
    }
  }

  private void notifyResultPendingConfirmation(TournamentMatch match, Member actor) {
    NotificationType notificationType = getOrCreateNotificationType("Resultat match");
    String message = "Resultat encode pour " + safeTeamName(match.getTeamA()) + " vs "
        + safeTeamName(match.getTeamB()) + " : "
        + match.getTeamAlphaScore() + "-" + match.getTeamBravoScore()
        + ". Merci de confirmer, corriger ou refuser.";
    notifyMatchTeams(match, notificationType, actor, message);
  }

  private void notifyResultResponse(
      TournamentMatch match,
      Team respondingTeam,
      String action,
      Member actor) {
    NotificationType notificationType = getOrCreateNotificationType("Suivi resultat match");
    String actionLabel = switch (action) {
      case "CONFIRM" -> "a confirme";
      case "CORRECT" -> "a propose une correction";
      case "REFUSE" -> "a refuse";
      default -> "a repondu a";
    };
    String message = respondingTeam.getNom() + " " + actionLabel + " le resultat du match "
        + safeTeamName(match.getTeamA()) + " vs " + safeTeamName(match.getTeamB())
        + " : " + match.getTeamAlphaScore() + "-" + match.getTeamBravoScore() + ".";
    notifyMatchTeams(match, notificationType, actor, message);
  }

  private void notifyMatchTeams(
      TournamentMatch match,
      NotificationType notificationType,
      Member excludeMember,
      String message) {
    notifyOneTeamForMatchEvent(match, match.getTeamA(), notificationType, excludeMember, message);
    notifyOneTeamForMatchEvent(match, match.getTeamB(), notificationType, excludeMember, message);
  }

  private void notifyOneTeamForMatchEvent(
      TournamentMatch match,
      Team team,
      NotificationType notificationType,
      Member excludeMember,
      String message) {
    if (team == null) {
      return;
    }

    String link = "/tournaments/" + match.getTournament().getId()
        + "?section=planning&matchId=" + match.getId();
    Long excludeMemberId = excludeMember != null ? excludeMember.getId() : null;

    getResponsibleRecipients(team).stream()
        .filter(recipient -> excludeMemberId == null
            || !Objects.equals(recipient.getId(), excludeMemberId))
        .forEach(recipient -> {
          Notification notification = new Notification();
          notification.setMessage(message);
          notification.setRedirectLink(link);
          notification.setSender(recipient);
          notification.setNotificationType(notificationType);
          notificationRepository.save(notification);
        });
  }

  private List<Member> getResponsibleRecipients(Team team) {
    Map<Long, Member> recipients = new LinkedHashMap<>();
    if (team.getResponsible() != null && team.getResponsible().getMember() != null) {
      recipients.put(team.getResponsible().getMember().getId(), team.getResponsible().getMember());
    }
    if (team.getSecondResponsible() != null && team.getSecondResponsible().getMember() != null) {
      recipients.put(
          team.getSecondResponsible().getMember().getId(),
          team.getSecondResponsible().getMember());
    }
    return new ArrayList<>(recipients.values());
  }

  private String safeTeamName(Team team) {
    return team != null && team.getNom() != null ? team.getNom() : "Equipe";
  }
}
