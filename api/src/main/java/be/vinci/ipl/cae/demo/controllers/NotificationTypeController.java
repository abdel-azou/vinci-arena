package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.CreateNotificationTypeRequest;
import be.vinci.ipl.cae.demo.models.dtos.NotificationTypeDto;
import be.vinci.ipl.cae.demo.services.NotificationTypeService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller handling notification type endpoints.
 */
@RestController
@RequestMapping("/notification-types")
public class NotificationTypeController {

  private final NotificationTypeService notificationTypeService;

  /**
   * Creates a NotificationTypeController.
   *
   * @param notificationTypeService notification type service
   */
  public NotificationTypeController(NotificationTypeService notificationTypeService) {
    this.notificationTypeService = notificationTypeService;
  }

  /**
   * Creates a notification type.
   *
   * @param request payload containing notification type name
   * @return created notification type
   */
  @PostMapping
  @PreAuthorize("isAuthenticated()")
  public NotificationTypeDto createNotificationType(
      @Valid @RequestBody CreateNotificationTypeRequest request) {
    try {
      return notificationTypeService.createNotificationType(request.name());
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
    }
  }

  /**
   * Returns all notification types.
   *
   * @return notification type list
   */
  @GetMapping
  @PreAuthorize("isAuthenticated()")
  public List<NotificationTypeDto> getNotificationTypes() {
    return notificationTypeService.getAllNotificationTypes();
  }
}
