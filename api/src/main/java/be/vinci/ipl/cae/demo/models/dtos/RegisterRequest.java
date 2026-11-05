package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Request used to register a new member. */
public record RegisterRequest(
    @NotBlank @Email String email,
    @NotBlank String tag,
    @NotBlank String password,
    @NotBlank String specialty,
    String profileImage
) {
}
