package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.dtos.NotificationTypeDto;
import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import be.vinci.ipl.cae.demo.repositories.NotificationTypeRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for NotificationTypeService.
 */
@ExtendWith(MockitoExtension.class)
class NotificationTypeServiceTest {

  @Mock
  private NotificationTypeRepository notificationTypeRepository;

  @InjectMocks
  private NotificationTypeService notificationTypeService;

  @Test
  void createNotificationType_NewName_ReturnsCreatedType() {
    NotificationType saved = new NotificationType();
    saved.setId(1L);
    saved.setName("TEAM");

    when(notificationTypeRepository.findByName("TEAM")).thenReturn(Optional.empty());
    when(notificationTypeRepository.save(org.mockito.ArgumentMatchers.any(NotificationType.class)))
        .thenReturn(saved);

    NotificationTypeDto result = notificationTypeService.createNotificationType("TEAM");

    assertEquals(1L, result.id());
    assertEquals("TEAM", result.name());
  }

  @Test
  void createNotificationType_ExistingName_ThrowsException() {
    NotificationType existing = new NotificationType();
    existing.setId(2L);
    existing.setName("TEAM");

    when(notificationTypeRepository.findByName("TEAM")).thenReturn(Optional.of(existing));

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> notificationTypeService.createNotificationType("TEAM"));

    assertEquals("Notification type already exists", exception.getMessage());
  }

  @Test
  void getAllNotificationTypes_ReturnsList() {
    NotificationType first = new NotificationType();
    first.setId(1L);
    first.setName("TEAM");

    NotificationType second = new NotificationType();
    second.setId(2L);
    second.setName("EVENT");

    when(notificationTypeRepository.findAll()).thenReturn(List.of(first, second));

    List<NotificationTypeDto> result = notificationTypeService.getAllNotificationTypes();

    assertEquals(2, result.size());
    assertEquals("TEAM", result.getFirst().name());
    verify(notificationTypeRepository).findAll();
  }
}
