package be.vinci.ipl.cae.demo.models.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

/**
 * DTO returned by notification endpoints.
 */
public record NotificationDto(
    Long id,
    String message,
    @JsonProperty("isRead") boolean isRead,
    LocalDateTime sentAt,
    Long senderId,
    String senderTag,
    String redirectLink,
    Long notificationTypeId,
    String notificationTypeName) {
}
