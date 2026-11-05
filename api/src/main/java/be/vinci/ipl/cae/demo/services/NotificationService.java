package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.ForbiddenException;
import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationTypeRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service for notification operations.
 */
@Service
@Transactional
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final NotificationTypeRepository notificationTypeRepository;
  private final MemberRepository memberRepository;

  /**
   * Creates a new NotificationService.
   *
   * @param notificationRepository repository for notifications
   * @param notificationTypeRepository repository for notification types
   * @param memberRepository repository for members
   */
  public NotificationService(
      NotificationRepository notificationRepository,
      NotificationTypeRepository notificationTypeRepository,
      MemberRepository memberRepository) {
    this.notificationRepository = notificationRepository;
    this.notificationTypeRepository = notificationTypeRepository;
    this.memberRepository = memberRepository;
  }

  /**
   * Creates a notification for the authenticated sender.
   *
   * @param sender authenticated member
   * @param message notification message
   * @param redirectLink target link on click
   * @param notificationTypeId notification type id
   * @return saved notification dto
   */
  public NotificationDto createNotification(Member sender, String message,
      String redirectLink, Long notificationTypeId) {
    Member senderInDb = memberRepository.findById(sender.getId())
        .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

    NotificationType notificationType = notificationTypeRepository.findById(notificationTypeId)
        .orElseThrow(() -> new IllegalArgumentException("Notification type not found"));

    Notification notification = new Notification();
    notification.setMessage(message);
    notification.setRedirectLink(redirectLink);
    notification.setSender(senderInDb);
    notification.setNotificationType(notificationType);

    Notification savedNotification = notificationRepository.save(notification);
    return toDto(savedNotification);
  }

  /**
   * Returns the notifications of a sender, newest first.
   *
   * @param sender authenticated sender
   * @return ordered notifications
   */
  public List<NotificationDto> getNotificationsForSender(Member sender) {
    Member senderInDb = memberRepository.findById(sender.getId())
        .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

    return notificationRepository.findBySenderIdOrderBySentAtDesc(senderInDb.getId())
        .stream()
        .map(this::toDto)
        .toList();
  }

  /**
   * Marks a sender notification as read.
   *
   * @param sender authenticated sender
   * @param notificationId notification id
   * @return updated notification
   */
  public NotificationDto markAsRead(Member sender, Long notificationId) {
    Notification notification = notificationRepository.findById(notificationId)
        .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

    if (!notification.getSender().getId().equals(sender.getId())) {
      throw new ForbiddenException("Access denied");
    }

    notification.setRead(true);
    Notification updatedNotification = notificationRepository.save(notification);
    return toDto(updatedNotification);
  }

  private NotificationDto toDto(Notification notification) {
    return new NotificationDto(
        notification.getId(),
        notification.getMessage(),
        notification.isRead(),
        notification.getSentAt(),
        notification.getSender().getId(),
        notification.getSender().getTag(),
        notification.getRedirectLink(),
        notification.getNotificationType().getId(),
        notification.getNotificationType().getName());
  }
}
