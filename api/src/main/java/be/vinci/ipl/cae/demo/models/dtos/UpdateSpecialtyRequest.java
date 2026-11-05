package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.NotBlank;

/** Request used to update a member specialty. */
public record UpdateSpecialtyRequest(@NotBlank String specialty) {
}
