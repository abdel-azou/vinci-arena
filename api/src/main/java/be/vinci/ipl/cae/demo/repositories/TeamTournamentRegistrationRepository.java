package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.TeamTournamentRegistration;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for team tournament registrations.
 */
public interface TeamTournamentRegistrationRepository
    extends JpaRepository<TeamTournamentRegistration, Long> {

  /**
   * Checks whether a team is already registered to a tournament.
   */
  boolean existsByTeamIdAndTournamentId(Long teamId, Long tournamentId);

  /**
   * Returns tournament registrations ordered by registration date.
   */
  List<TeamTournamentRegistration> findByTournamentIdOrderByRegistrationDateAsc(Long tournamentId);

  /**
   * Returns registrations for one team ordered by tournament start date.
   */
  List<TeamTournamentRegistration> findByTeamIdOrderByTournamentStartDateAsc(Long teamId);

  /**
   * Returns every registration ordered by tournament start date.
   */
  List<TeamTournamentRegistration> findAllByOrderByTournamentStartDateAsc();
}
