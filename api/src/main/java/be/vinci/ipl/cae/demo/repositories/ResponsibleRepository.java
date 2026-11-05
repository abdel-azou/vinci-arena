package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Responsible;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/** * Responsible repository for Vinci Arena.
 */
@Repository
public interface ResponsibleRepository extends CrudRepository<Responsible, Long> {

}
