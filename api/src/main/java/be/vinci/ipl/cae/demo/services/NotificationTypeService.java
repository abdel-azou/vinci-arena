package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NotificationTypeDto;
import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import be.vinci.ipl.cae.demo.repositories.NotificationTypeRepository;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service for notification type operations.
 */
@Service
@Transactional
public class NotificationTypeService {

  private final NotificationTypeRepository notificationTypeRepository;

  /**
   * Creates a new NotificationTypeService.
   *
   * @param notificationTypeRepository notification type repository
   */
  public NotificationTypeService(NotificationTypeRepository notificationTypeRepository) {
    this.notificationTypeRepository = notificationTypeRepository;
  }

  /**
   * Creates a new notification type if name is unique.
   *
   * @param name type name
   * @return created notification type
   */
  public NotificationTypeDto createNotificationType(String name) {
    String normalizedName = name.trim();
    if (notificationTypeRepository.findByName(normalizedName).isPresent()) {
      throw new IllegalArgumentException("Notification type already exists");
    }

    NotificationType notificationType = new NotificationType();
    notificationType.setName(normalizedName);

    NotificationType savedNotificationType = notificationTypeRepository.save(notificationType);
    return toDto(savedNotificationType);
  }

  /**
   * Returns all notification types.
   *
   * @return list of notification types
   */
  public List<NotificationTypeDto> getAllNotificationTypes() {
    List<NotificationTypeDto> notificationTypes = new ArrayList<>();
    for (NotificationType notificationType : notificationTypeRepository.findAll()) {
      notificationTypes.add(toDto(notificationType));
    }
    return notificationTypes;
  }

  private NotificationTypeDto toDto(NotificationType notificationType) {
    return new NotificationTypeDto(notificationType.getId(), notificationType.getName());
  }
}
