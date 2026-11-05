package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for notification types.
 */
@Repository
public interface NotificationTypeRepository extends CrudRepository<NotificationType, Long> {

  /**
   * Finds a notification type by name.
   *
   * @param name type name
   * @return notification type if found
   */
  Optional<NotificationType> findByName(String name);
}
