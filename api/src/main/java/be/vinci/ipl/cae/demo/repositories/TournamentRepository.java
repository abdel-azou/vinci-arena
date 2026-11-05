package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for Tournament entities.
 */
public interface TournamentRepository extends JpaRepository<Tournament, Long> {
  /** Checks if a tournament name already exists. */
  boolean existsByName(String name);

  /** Checks if a tournament name already exists on another tournament. */
  boolean existsByNameAndIdNot(String name, Long id);

  /** Returns all draft tournaments ordered by start date. */
  List<Tournament> findByStatusOrderByStartDateAsc(TournamentStatus status);

  /**
   * Returns tournaments owned by a given admin entity.
   */
  List<Tournament> findByAdministratorId(Long administratorId);
}
