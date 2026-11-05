package be.vinci.ipl.cae.demo.models.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request used by an admin to encode a match result.
 */
public record UpdateMatchResultRequest(
    @JsonProperty("teamAScore") @NotNull @Min(0) Integer teamAlphaScore,
    @JsonProperty("teamBScore") @NotNull @Min(0) Integer teamBravoScore) {
}
