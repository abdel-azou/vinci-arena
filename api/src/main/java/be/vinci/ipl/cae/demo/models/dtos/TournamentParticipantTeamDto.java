package be.vinci.ipl.cae.demo.models.dtos;

import java.util.List;

/**
 * DTO representing one participating team inside tournament data.
 */
public record TournamentParticipantTeamDto(
    Long teamId,
    String teamName,
    List<String> memberTags
) {
}
