package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.JoinRequestStatus;
import be.vinci.ipl.cae.demo.models.entities.TeamJoinRequest;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for team join requests.
 */
@Repository
public interface TeamJoinRequestRepository extends CrudRepository<TeamJoinRequest, Long> {

  /**
   * Checks whether a member already has a request with this status for a team.
   *
   * @param memberId member identifier
   * @param teamId team identifier
   * @param status request status
   * @return true if such a request exists
   */
  boolean existsByMemberIdAndTeamIdAndStatus(
      Long memberId,
      Long teamId,
      JoinRequestStatus status);

  /**
   * Returns requests by team and status ordered by creation date.
   *
   * @param teamId team identifier
   * @param status request status
   * @return matching requests ordered ascending by creation date
   */
  List<TeamJoinRequest> findByTeamIdAndStatusOrderByCreatedAtAsc(
      Long teamId,
      JoinRequestStatus status);

  /**
   * Returns requests for a member by status.
   *
   * @param memberId member identifier
   * @param status request status
   * @return matching requests
   */
  List<TeamJoinRequest> findByMemberIdAndStatus(Long memberId, JoinRequestStatus status);

  /**
   * Returns all requests linked to one team.
   *
   * @param teamId team identifier
   * @return matching requests
   */
  List<TeamJoinRequest> findByTeamId(Long teamId);

  /**
   * Returns all requests linked to one member.
   *
   * @param memberId member identifier
   * @return matching requests
   */
  List<TeamJoinRequest> findByMemberId(Long memberId);
}
