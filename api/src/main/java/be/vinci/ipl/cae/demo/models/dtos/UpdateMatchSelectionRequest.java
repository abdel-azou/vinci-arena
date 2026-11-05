package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Request payload to update one team selection for a match.
 */
public record UpdateMatchSelectionRequest(
    @NotNull
    @Size(min = 1, max = 4)
    List<Long> playerIds
) {
}
