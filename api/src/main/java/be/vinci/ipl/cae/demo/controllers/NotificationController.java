package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.ApiException;
import be.vinci.ipl.cae.demo.models.dtos.CreateNotificationRequest;
import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.services.NotificationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller handling notification endpoints.
 */
@RestController
@RequestMapping("/notifications")
public class NotificationController {

  private final NotificationService notificationService;

  /**
   * Creates a NotificationController.
   *
   * @param notificationService notification service
   */
  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  /**
   * Creates a new notification.
   *
   * @param request request payload
   * @param currentMember authenticated member
   * @return created notification
   */
  @PostMapping
  @PreAuthorize("isAuthenticated()")
  public NotificationDto createNotification(
      @Valid @RequestBody CreateNotificationRequest request,
      @AuthenticationPrincipal Member currentMember) {
    try {
      return notificationService.createNotification(
          currentMember,
          request.message(),
          request.redirectLink(),
          request.notificationTypeId());
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
   * Returns notifications of the authenticated sender.
   *
   * @param currentMember authenticated member
   * @return sender notifications
   */
  @GetMapping("/me")
  @PreAuthorize("isAuthenticated()")
  public List<NotificationDto> getMyNotifications(@AuthenticationPrincipal Member currentMember) {
    try {
      return notificationService.getNotificationsForSender(currentMember);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
   * Marks a notification as read.
   *
   * @param notificationId notification id
   * @param currentMember authenticated member
   * @return updated notification
   */
  @PatchMapping("/{notificationId}/read")
  @PreAuthorize("isAuthenticated()")
  public NotificationDto markAsRead(@PathVariable Long notificationId,
      @AuthenticationPrincipal Member currentMember) {
    try {
      return notificationService.markAsRead(currentMember, notificationId);
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.BAD_REQUEST);
    }
  }

  private ResponseStatusException mapIllegalArgument(
      IllegalArgumentException e,
      HttpStatus defaultStatus) {
    if (e instanceof ApiException apiException) {
      return new ResponseStatusException(apiException.getStatus(), e.getMessage(), e);
    }
    return new ResponseStatusException(defaultStatus, e.getMessage(), e);
  }
}
