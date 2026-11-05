package be.vinci.ipl.cae.demo.models.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/**
 * Request used by a team responsible to answer an encoded result.
 */
public record RespondToMatchResultRequest(
    @NotBlank String action,
    @JsonProperty("teamAScore") @Min(0) Integer teamAlphaScore,
    @JsonProperty("teamBScore") @Min(0) Integer teamBravoScore) {
}
