package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.NotBlank;

/** Request used to create a notification type. */
public record CreateNotificationTypeRequest(@NotBlank String name) {
}
