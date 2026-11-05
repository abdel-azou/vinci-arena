package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Request payload to update a tournament match.
 */
@SuppressWarnings("checkstyle:AbbreviationAsWordInName")
public record UpdateTournamentMatchRequest(
    @NotNull Long teamAId,
    Long teamBId,
    @NotNull LocalDateTime scheduledDate
) {
}
