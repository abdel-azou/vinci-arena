package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationTypeRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for NotificationService.
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

  @Mock
  private NotificationRepository notificationRepository;

  @Mock
  private NotificationTypeRepository notificationTypeRepository;

  @Mock
  private MemberRepository memberRepository;

  @InjectMocks
  private NotificationService notificationService;

  private Member sender;
  private NotificationType type;

  @BeforeEach
  void setUp() {
    sender = new Member();
    sender.setId(1L);
    sender.setTag("member1");

    type = new NotificationType();
    type.setId(10L);
    type.setName("TEAM");
  }

  @Test
  void createNotification_ValidInput_ReturnsDto() {
    Notification saved = new Notification();
    saved.setId(100L);
    saved.setMessage("New event");
    saved.setRead(false);
    saved.setRedirectLink("/events/42");
    saved.setSentAt(LocalDateTime.of(2026, 3, 5, 10, 30));
    saved.setSender(sender);
    saved.setNotificationType(type);

    when(memberRepository.findById(1L)).thenReturn(Optional.of(sender));
    when(notificationTypeRepository.findById(10L)).thenReturn(Optional.of(type));
    when(notificationRepository.save(any(Notification.class))).thenReturn(saved);

    NotificationDto result = notificationService.createNotification(
        sender,
        "New event",
        "/events/42",
        10L);

    assertEquals(100L, result.id());
    assertEquals("New event", result.message());
    assertFalse(result.isRead());
    assertEquals("TEAM", result.notificationTypeName());
    verify(notificationRepository).save(any(Notification.class));
  }

  @Test
  void getNotificationsForSender_ReturnsOrderedDtos() {
    Notification first = new Notification();
    first.setId(1L);
    first.setMessage("One");
    first.setRead(false);
    first.setSentAt(LocalDateTime.of(2026, 3, 5, 11, 0));
    first.setSender(sender);
    first.setRedirectLink("/one");
    first.setNotificationType(type);

    Notification second = new Notification();
    second.setId(2L);
    second.setMessage("Two");
    second.setRead(true);
    second.setSentAt(LocalDateTime.of(2026, 3, 5, 10, 0));
    second.setSender(sender);
    second.setRedirectLink("/two");
    second.setNotificationType(type);

    when(memberRepository.findById(1L)).thenReturn(Optional.of(sender));
    when(notificationRepository.findBySenderIdOrderBySentAtDesc(1L))
        .thenReturn(List.of(first, second));

    List<NotificationDto> result = notificationService.getNotificationsForSender(sender);

    assertEquals(2, result.size());
    assertEquals("One", result.getFirst().message());
    assertEquals("Two", result.get(1).message());
  }

  @Test
  void markAsRead_OwnNotification_MarksRead() {
    Notification notification = new Notification();
    notification.setId(5L);
    notification.setRead(false);
    notification.setMessage("Message");
    notification.setRedirectLink("/teams");
    notification.setSentAt(LocalDateTime.of(2026, 3, 5, 9, 0));
    notification.setSender(sender);
    notification.setNotificationType(type);

    when(notificationRepository.findById(5L)).thenReturn(Optional.of(notification));
    when(notificationRepository.save(notification)).thenReturn(notification);

    NotificationDto result = notificationService.markAsRead(sender, 5L);

    assertTrue(result.isRead());
    verify(notificationRepository).save(notification);
  }

  @Test
  void markAsRead_OtherSender_ThrowsException() {
    Member other = new Member();
    other.setId(99L);
    other.setTag("other");

    Notification notification = new Notification();
    notification.setId(8L);
    notification.setSender(other);
    notification.setNotificationType(type);

    when(notificationRepository.findById(8L)).thenReturn(Optional.of(notification));

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> notificationService.markAsRead(sender, 8L));

    assertEquals("Access denied", exception.getMessage());
  }
}
