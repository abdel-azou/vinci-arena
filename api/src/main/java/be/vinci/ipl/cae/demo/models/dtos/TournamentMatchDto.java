package be.vinci.ipl.cae.demo.models.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO representing a tournament match.
 */
@SuppressWarnings("checkstyle:AbbreviationAsWordInName")
public record TournamentMatchDto(
    Long id,
    Long tournamentId,
    Long teamAId,
    String teamAName,
    Long teamBId,
    String teamBName,
    String round,
    LocalDateTime scheduledDate,
    String status,
    Long administratorId,
    List<MemberDto> selectionForTeamA,
    List<MemberDto> selectionForTeamB,
    boolean isBye,
    @JsonProperty("teamAScore") Integer teamAlphaScore,
    @JsonProperty("teamBScore") Integer teamBravoScore,
    String resultStatus,
    @JsonProperty("teamAResultResponse") String teamAlphaResultResponse,
    @JsonProperty("teamBResultResponse") String teamBravoResultResponse
) {
}
