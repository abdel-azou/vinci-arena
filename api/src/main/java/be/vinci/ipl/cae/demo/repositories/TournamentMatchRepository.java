package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.TournamentMatch;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for tournament matches.
 */
@Repository
public interface TournamentMatchRepository extends JpaRepository<TournamentMatch, Long> {

  /**
   * Finds all matches for a tournament ordered by scheduled date.
   */
  List<TournamentMatch> findByTournamentIdOrderByScheduledDateAsc(Long tournamentId);

  /**
   * Finds all matches where a team played (as teamA or teamB) ordered by tournament start date.
   */
  @SuppressWarnings("checkstyle:AbbreviationAsWordInName")
  List<TournamentMatch> findByTeamAIdOrTeamBIdOrderByTournamentStartDateAsc(
      Long teamAId, Long teamBId);

  /**
   * Deletes all matches for a tournament.
   */
  void deleteByTournamentId(Long tournamentId);

  /**
   * Finds all matches by administrator.
   */
  List<TournamentMatch> findByAdministratorId(Long administratorId);
}
