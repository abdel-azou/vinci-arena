package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Request used to create a notification. */
public record CreateNotificationRequest(
    @NotBlank String message,
    @NotBlank String redirectLink,
    @NotNull Long notificationTypeId
) {
}
