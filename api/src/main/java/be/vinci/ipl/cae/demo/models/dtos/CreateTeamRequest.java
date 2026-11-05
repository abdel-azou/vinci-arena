package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.NotBlank;

/** Request used to create a team. */
public record CreateTeamRequest(
    @NotBlank String nom,
    Long secondResponsibleId
) {
}
