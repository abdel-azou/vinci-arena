package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Notification;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for notifications.
 */
@Repository
public interface NotificationRepository extends CrudRepository<Notification, Long> {

  /**
   * Finds notifications for a sender ordered by newest first.
   *
   * @param senderId sender identifier
   * @return ordered notifications
   */
  List<Notification> findBySenderIdOrderBySentAtDesc(Long senderId);

  /**
   * Returns all notifications sent by a member.
   *
   * @param senderId sender identifier
   * @return matching notifications
   */
  List<Notification> findBySenderId(Long senderId);
}
