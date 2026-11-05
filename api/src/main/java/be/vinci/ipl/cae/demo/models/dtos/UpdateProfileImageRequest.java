package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.NotBlank;

/** Request used to update a member profile image. */
public record UpdateProfileImageRequest(@NotBlank String profileImage) {
}
