package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.MemberUnavailability;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for managing MemberUnavailability entities.
 */
@Repository
public interface MemberUnavailabilityRepository
    extends CrudRepository<MemberUnavailability, Long> {

  /**
   * Finds all unavailabilities for a given member.
   *
   * @param memberId the member id
   * @return the list of unavailabilities
   */
  List<MemberUnavailability> findByMemberId(Long memberId);
}
