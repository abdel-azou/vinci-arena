package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDateTime;

/**
 * Public tournament information exposed on a member profile.
 */
public record PublicMemberTournamentDto(
    Long id,
    String name,
    LocalDateTime startDate,
    LocalDateTime endDate,
    String status) {
}