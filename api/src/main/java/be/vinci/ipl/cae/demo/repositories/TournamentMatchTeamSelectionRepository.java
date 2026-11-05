package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.TournamentMatchTeamSelection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for tournament match team selections.
 */
@Repository
public interface TournamentMatchTeamSelectionRepository
    extends JpaRepository<TournamentMatchTeamSelection, Long> {

  /**
   * Finds all selections containing a given player.
   */
  @Query(
      value = """
          select distinct s.*
          from tournament_match_team_selections s
          join tournament_match_team_selection_players p
            on p.selection_id = s.id
          where p.member_id = :memberId
          """,
      nativeQuery = true)
  List<TournamentMatchTeamSelection> findAllByPlayerId(@Param("memberId") Long memberId);

  /**
   * Finds one selection for one team in one match.
   */
  Optional<TournamentMatchTeamSelection> findByMatchIdAndTeamId(Long matchId, Long teamId);

  /**
   * Finds all team selections for a match.
   */
  List<TournamentMatchTeamSelection> findByMatchId(Long matchId);
}
