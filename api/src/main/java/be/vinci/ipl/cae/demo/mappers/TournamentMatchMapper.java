package be.vinci.ipl.cae.demo.mappers;

import be.vinci.ipl.cae.demo.models.dtos.MemberDto;
import be.vinci.ipl.cae.demo.models.dtos.TournamentMatchDto;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.TournamentMatch;
import java.util.List;

/**
 * Mapper class for converting TournamentMatch entities to DTOs.
 */
public final class TournamentMatchMapper {
  private TournamentMatchMapper() {
    throw new UnsupportedOperationException(
        "This is a utility class and cannot be instantiated");
  }

  /**
   * Converts a TournamentMatch entity to a DTO.
   */
  public static TournamentMatchDto toDto(TournamentMatch match) {
    return toDto(match, List.of(), List.of());
  }

  /**
   * Converts a TournamentMatch entity to a DTO with visible selections.
   */
  public static TournamentMatchDto toDto(
      TournamentMatch match,
      List<MemberDto> selectionForTeamA,
      List<MemberDto> selectionForTeamB) {
    if (match == null) {
      return null;
    }
    Team teamA = match.getTeamA();
    Team teamB = match.getTeamB();
    Long adminId =
        match.getAdministrator() != null && match.getAdministrator().getMember() != null
            ? match.getAdministrator().getMember().getId()
            : match.getAdministrator() != null ? match.getAdministrator().getId() : null;
    return new TournamentMatchDto(
        match.getId(),
        match.getTournament() != null ? match.getTournament().getId() : null,
        teamA != null ? teamA.getId() : null,
        teamA != null ? teamA.getNom() : null,
        teamB != null ? teamB.getId() : null,
        teamB != null ? teamB.getNom() : null,
        match.getRound() != null ? match.getRound().name() : null,
        match.getScheduledDate(),
        match.getStatus() != null ? match.getStatus().name() : null,
        adminId,
        selectionForTeamA != null ? selectionForTeamA : List.of(),
        selectionForTeamB != null ? selectionForTeamB : List.of(),
        match.isBye(),
        match.getTeamAlphaScore(),
        match.getTeamBravoScore(),
        match.getResultStatus() != null ? match.getResultStatus().name() : null,
        match.getTeamAlphaResultResponse() != null
            ? match.getTeamAlphaResultResponse().name()
            : null,
        match.getTeamBravoResultResponse() != null
            ? match.getTeamBravoResultResponse().name()
            : null
    );
  }
}
