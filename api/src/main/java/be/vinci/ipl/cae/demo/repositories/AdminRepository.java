package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Admin;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository for Admin entities.
 */
public interface AdminRepository extends CrudRepository<Admin, Long> {
}
