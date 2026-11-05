package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

/**
 * Request used to create a tournament.
 */
public record CreateTournamentRequest(
    @NotBlank String name,
    @NotBlank String description,
    @NotNull LocalDateTime startDate,
    @NotNull LocalDateTime endDate,
    @NotNull LocalDateTime registrationDeadline,
    @NotNull @Positive Integer maxTeams
) {
}
