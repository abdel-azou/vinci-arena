package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Public profile DTO exposing non-sensitive member information.
 */
public record PublicMemberDto(
    Long id,
    String tag,
    String specialty,
    String profileImage,
    String teamName,
    List<PublicMemberTournamentDto> tournaments,
    LocalDateTime createdAt,
    String role) {
}
