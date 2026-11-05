package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.NotBlank;

/** Request used to change the password of the authenticated member. */
public record ChangePasswordRequest(
    @NotBlank String currentPassword,
    @NotBlank String newPassword
) {
}
