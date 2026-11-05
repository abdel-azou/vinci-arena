package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request body carrying the target member email for admin role updates.
 */
public record AdminRoleRequest(@NotBlank @Email String email) {
}
