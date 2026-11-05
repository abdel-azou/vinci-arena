package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Specialty;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Specialty repository.
 */
@Repository
public interface SpecialtyRepository extends CrudRepository<Specialty, Long> {

  /**
   * Finds a specialty by code.
   */
  Optional<Specialty> findByCode(String code);

  /**
   * Checks if specialty code exists.
   */
  boolean existsByCode(String code);
}
