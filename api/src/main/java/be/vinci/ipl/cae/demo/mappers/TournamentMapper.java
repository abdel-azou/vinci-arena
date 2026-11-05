package be.vinci.ipl.cae.demo.mappers;

import be.vinci.ipl.cae.demo.models.dtos.TournamentDto;
import be.vinci.ipl.cae.demo.models.dtos.TournamentParticipantTeamDto;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import java.util.List;

/** Mapper class for converting Tournament entities to TournamentDTOs. */
public final class TournamentMapper {
  /** Private constructor to prevent instantiation. */
  private TournamentMapper() {
    throw new UnsupportedOperationException(
        "This is a utility class and cannot be instantiated");
  }

  /** Converts a Tournament entity to a TournamentDTO. */
  public static TournamentDto toDto(Tournament tournament) {
    return toDto(tournament, List.of(), List.of());
  }

  /** Converts a Tournament entity to a TournamentDTO with registration data. */
  public static TournamentDto toDto(
      Tournament tournament,
      List<String> registeredTeamNames,
      List<TournamentParticipantTeamDto> participantTeams) {
    if (tournament == null) {
      return null;
    }
    List<String> safeRegisteredTeamNames =
        registeredTeamNames == null ? List.of() : List.copyOf(registeredTeamNames);
    List<TournamentParticipantTeamDto> safeParticipantTeams =
        participantTeams == null ? List.of() : List.copyOf(participantTeams);
    Long administratorId =
        tournament.getAdministrator() != null && tournament.getAdministrator().getMember() != null
            ? tournament.getAdministrator().getMember().getId()
            : tournament.getAdministrator() != null ? tournament.getAdministrator().getId() : null;
    return new TournamentDto(
        tournament.getId(),
        tournament.getName(),
        tournament.getDescription(),
        tournament.getWinnerTeamName(),
        tournament.getStartDate(),
        tournament.getEndDate(),
        tournament.getRegistrationDeadline(),
        tournament.getMaxTeams(),
        tournament.getStatus().name(),
        administratorId,
        safeRegisteredTeamNames.size(),
        safeRegisteredTeamNames,
        safeParticipantTeams
    );
  }
}
