package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Team;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Team repository for Vinci Arena.
 */
@Repository
public interface TeamRepository extends CrudRepository<Team, Long> {

  /**
   * Checks if a team name already exists.
   */
  boolean existsByNom(String nom);

  /**
   * Finds a team by its name.
   */
  Optional<Team> findByNom(String nom);

  /**
   * Returns all teams.
   */
  @Override
  List<Team> findAll();

  /**
   * Finds the team where the given member is the main responsible.
   */
  Team findByResponsibleMemberId(Long memberId);

  /**
   * Finds the team where the given member is the second responsible.
   */
  Team findBySecondResponsibleMemberId(Long memberId);
}
