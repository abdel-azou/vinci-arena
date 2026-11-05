package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Request used to authenticate a member. */
public record Credentials(
    @NotBlank @Email String email,
    @NotBlank String password,
    boolean rememberMe
) {
}
