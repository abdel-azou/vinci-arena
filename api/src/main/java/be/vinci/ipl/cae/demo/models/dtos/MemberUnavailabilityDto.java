package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * DTO representing a member unavailability period.
 */
public record MemberUnavailabilityDto(
    Long id,
    @NotNull LocalDate startDate,
    @NotNull LocalDate endDate) {
}
