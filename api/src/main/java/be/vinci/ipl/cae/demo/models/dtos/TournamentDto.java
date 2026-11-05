package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO returned for tournament data.
 */
public record TournamentDto(
    Long id,
    String name,
    String description,
    String winnerTeamName,
    LocalDateTime startDate,
    LocalDateTime endDate,
    LocalDateTime registrationDeadline,
    Integer maxTeams,
    String status,
    Long administratorId,
    Integer registeredTeamsCount,
    List<String> registeredTeamNames,
    List<TournamentParticipantTeamDto> participantTeams
) {
}
