package be.vinci.ipl.cae.demo;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentMatch;
import be.vinci.ipl.cae.demo.models.entities.TournamentMatchTeamSelection;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentMatchRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentMatchTeamSelectionRepository;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Initializes team selections for completed tournament matches.
 */
@Component
@Order(3)
@Transactional
@ConditionalOnProperty(name = "app.demo.seed.enabled", havingValue = "true")
public class TournamentMatchSelectionInitializer implements CommandLineRunner {

  private final TournamentMatchRepository tournamentMatchRepository;
  private final TournamentMatchTeamSelectionRepository selectionRepository;
  private final MemberRepository memberRepository;

  private static final Map<TournamentMatch.Round, Integer> ROUND_ORDER = new HashMap<>();

  static {
    ROUND_ORDER.put(TournamentMatch.Round.FINAL, 0);
    ROUND_ORDER.put(TournamentMatch.Round.SEMI_FINAL, 1);
    ROUND_ORDER.put(TournamentMatch.Round.QUARTER_FINAL, 2);
    ROUND_ORDER.put(TournamentMatch.Round.ROUND_OF_16, 3);
    ROUND_ORDER.put(TournamentMatch.Round.ROUND_OF_32, 4);
    ROUND_ORDER.put(TournamentMatch.Round.ROUND_OF_64, 5);
    ROUND_ORDER.put(TournamentMatch.Round.ROUND_OF_128, 6);
    ROUND_ORDER.put(TournamentMatch.Round.PREMIER_TOUR, 7);
  }

  /**
   * Constructor.
   */
  public TournamentMatchSelectionInitializer(
      TournamentMatchRepository tournamentMatchRepository,
      TournamentMatchTeamSelectionRepository selectionRepository,
      MemberRepository memberRepository) {
    this.tournamentMatchRepository = tournamentMatchRepository;
    this.selectionRepository = selectionRepository;
    this.memberRepository = memberRepository;
  }

  @Override
  @Transactional
  public void run(String... args) {
    seedMatchSelections();
  }

  private void seedMatchSelections() {
    List<TournamentMatch> allMatches = tournamentMatchRepository.findAll();

    if (allMatches.isEmpty()) {
      System.out.println("[TournamentMatchSelectionInitializer] Aucun match trouve. "
          + "Les selections ne seront pas creees.");
      return;
    }

    List<TournamentMatch> completedMatches = allMatches.stream()
        .filter(match -> match.getStatus() == TournamentMatch.Status.COMPLETED)
        .toList();

    System.out.println("[TournamentMatchSelectionInitializer] " + completedMatches.size()
        + " matchs termines trouves. Attribution des scores coherents...");

    Map<Long, List<TournamentMatch>> matchesByTournament = completedMatches.stream()
        .collect(Collectors.groupingBy(match -> match.getTournament().getId()));

    int scoresAssigned = 0;
    for (Map.Entry<Long, List<TournamentMatch>> entry : matchesByTournament.entrySet()) {
      List<TournamentMatch> tournamentMatches = entry.getValue();
      Tournament tournament = tournamentMatches.get(0).getTournament();
      scoresAssigned += assignConsistentScores(tournament, tournamentMatches);
    }

    int selectionsCreated = 0;
    for (TournamentMatch match : completedMatches) {
      boolean createdA = createSelectionForTeamIfNeeded(match, match.getTeamA());
      if (createdA) {
        selectionsCreated++;
      }

      if (match.getTeamB() != null) {
        boolean createdB = createSelectionForTeamIfNeeded(match, match.getTeamB());
        if (createdB) {
          selectionsCreated++;
        }
      }
    }

    tournamentMatchRepository.saveAll(completedMatches);
    System.out.println("[TournamentMatchSelectionInitializer] " + scoresAssigned
        + " scores assigns et " + selectionsCreated + " selections creees.");
  }

  private int assignConsistentScores(Tournament tournament, List<TournamentMatch> matches) {
    if (tournament.getStatus() != TournamentStatus.TERMINE) {
      return 0;
    }

    String tournamentWinnerName = tournament.getWinnerTeamName();
    if (tournamentWinnerName == null) {
      return 0;
    }

    // Build a map of teams that appear in later rounds (they won their earlier matches)
    List<TournamentMatch> sortedByRound = matches.stream()
        .sorted(Comparator.comparingInt(
            m -> ROUND_ORDER.getOrDefault(m.getRound(), 999)))
        .toList();

    // Process from first round to final (so later matches have winners set)
    for (TournamentMatch match : sortedByRound) {
      if (match.getTeamAlphaScore() != null && match.getTeamBravoScore() != null) {
        continue;
      }
      Team winner = determineWinnerForMatch(match, tournamentWinnerName, sortedByRound);
      if (winner != null) {
        assignWinnerScores(match, winner);
      }
    }

    return (int) matches.stream()
        .filter(m -> m.getTeamAlphaScore() != null && m.getTeamBravoScore() != null)
        .count();
  }

  private Team determineWinnerForMatch(TournamentMatch match, String tournamentWinnerName,
      List<TournamentMatch> allMatches) {
    if (match.isBye() || match.getTeamA() == null || match.getTeamB() == null) {
      return null;
    }

    Team teamA = match.getTeamA();
    Team teamB = match.getTeamB();
    int roundOrder = ROUND_ORDER.getOrDefault(match.getRound(), 999);

    // Find teams that appear in later rounds (they are winners)
    Set<Long> teamsInLaterRounds = new HashSet<>();
    for (TournamentMatch laterMatch : allMatches) {
      int laterRoundOrder = ROUND_ORDER.getOrDefault(laterMatch.getRound(), 999);
      if (laterRoundOrder < roundOrder) {
        if (laterMatch.getTeamA() != null) {
          teamsInLaterRounds.add(laterMatch.getTeamA().getId());
        }
        if (laterMatch.getTeamB() != null) {
          teamsInLaterRounds.add(laterMatch.getTeamB().getId());
        }
      }
    }

    // The winner is the team that appears in a later round
    // The loser is the team that does NOT appear in later rounds
    boolean teamAlphaInLater = teamsInLaterRounds.contains(teamA.getId());
    boolean teamBravoInLater = teamsInLaterRounds.contains(teamB.getId());

    if (teamAlphaInLater && !teamBravoInLater) {
      return teamA;
    } else if (teamBravoInLater && !teamAlphaInLater) {
      return teamB;
    } else if (teamAlphaInLater && teamBravoInLater) {
      // Both in later rounds - possible in FINAL where both came from previous rounds
      // Use tournament winner to determine
      if (tournamentWinnerName != null) {
        if (teamA.getNom().equals(tournamentWinnerName)) {
          return teamA;
        } else if (teamB.getNom().equals(tournamentWinnerName)) {
          return teamB;
        }
      }
      // Fallback: use existing scores if available
      if (match.getTeamAlphaScore() != null && match.getTeamBravoScore() != null) {
        return match.getTeamAlphaScore() > match.getTeamBravoScore() ? teamA : teamB;
      }
      return teamA;
    } else {
      // Neither in later rounds - this is the last round before final (no winner determined yet)
      // This happens when processing SEMI_FINAL but both teams appear in FINAL
      // For now, use tournament winner
      if (tournamentWinnerName != null) {
        if (teamA.getNom().equals(tournamentWinnerName)) {
          return teamA;
        } else if (teamB.getNom().equals(tournamentWinnerName)) {
          return teamB;
        }
      }
      return teamA;
    }
  }

  private void assignWinnerScores(TournamentMatch match, Team winner) {
    if (match.getTeamAlphaScore() != null && match.getTeamBravoScore() != null) {
      return;
    }

    int winnerScore = (int) (Math.random() * 5) + 6;
    int loserScore = (int) (Math.random() * 4) + 1;

    if (winner.getId().equals(match.getTeamA().getId())) {
      match.setTeamAlphaScore(winnerScore);
      match.setTeamBravoScore(loserScore);
    } else {
      match.setTeamAlphaScore(loserScore);
      match.setTeamBravoScore(winnerScore);
    }

    match.setResultStatus(TournamentMatch.ResultStatus.CONFIRMED);
    match.setTeamAlphaResultResponse(TournamentMatch.TeamResultResponse.CONFIRMED);
    match.setTeamBravoResultResponse(TournamentMatch.TeamResultResponse.CONFIRMED);
  }

  private boolean createSelectionForTeamIfNeeded(TournamentMatch match, Team team) {
    if (team == null) {
      return false;
    }

    Optional<TournamentMatchTeamSelection> existingSelection =
        selectionRepository.findByMatchIdAndTeamId(match.getId(), team.getId());

    if (existingSelection.isPresent()) {
      return false;
    }

    List<Member> teamMembers = memberRepository.findByTeamId(team.getId());
    if (teamMembers.isEmpty()) {
      return false;
    }

    Set<Member> selectedPlayers = teamMembers.stream()
        .limit(5)
        .collect(Collectors.toSet());

    TournamentMatchTeamSelection selection = new TournamentMatchTeamSelection();
    selection.setMatch(match);
    selection.setTeam(team);
    selection.setPlayers(selectedPlayers);

    selectionRepository.save(selection);
    return true;
  }
}
