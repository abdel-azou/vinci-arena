package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Member.Role;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Member repository for Vinci Arena.
 */
@Repository
public interface MemberRepository extends CrudRepository<Member, Long> {

  /**
   * Find member by email.
   */
  Member findByEmail(String email);

  /**
   * Find member by email with team loaded.
   */
  @org.springframework.data.jpa.repository.Query(
      "SELECT m FROM Member m LEFT JOIN FETCH m.team WHERE m.email = :email")
  Member findByEmailWithTeam(
      @org.springframework.data.repository.query.Param("email") String email);

  /**
   * Find member by tag.
   */
  Member findByTag(String tag);

  /**
   * Find member by tag with team loaded.
   */
  @org.springframework.data.jpa.repository.Query(
      "SELECT m FROM Member m LEFT JOIN FETCH m.team WHERE m.tag = :tag")
  Member findByTagWithTeam(@org.springframework.data.repository.query.Param("tag") String tag);

  /**
   * Check if email exists.
   */
  boolean existsByEmail(String email);

  /**
   * Check if tag exists.
   */
  boolean existsByTag(String tag);

  /**
   * Checks if a tag already exists inside one team.
   */
  boolean existsByTagAndTeamId(String tag, Long teamId);

  /**
   * Checks if a tag already exists inside one team, excluding one member.
   */
  boolean existsByTagAndTeamIdAndIdNot(String tag, Long teamId, Long memberId);

  /**
   * Récupère tous les membres appartenant à une équipe spécifique.
   */
  List<Member> findByTeamId(Long teamId);

  /**
   * Counts members belonging to a specific team.
   */
  long countByTeamId(Long teamId);

  /**
   * Find members by role.
   */
  List<Member> findByRole(Role role);
}
