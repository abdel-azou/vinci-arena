package be.vinci.ipl.cae.demo.mappers;

import be.vinci.ipl.cae.demo.models.dtos.ResponsibleDto;
import be.vinci.ipl.cae.demo.models.dtos.TeamDto;
import be.vinci.ipl.cae.demo.models.entities.Responsible;
import be.vinci.ipl.cae.demo.models.entities.Team;
import java.util.List;

/** Mapper class for converting between Team entities and TeamDTOs. */
public final class TeamMapper {
  /** Private constructor to prevent instantiation. */
  private TeamMapper() {
    throw new UnsupportedOperationException(
        "This is a utility class and cannot be instantiated");
  }

  /** Converts a Team entity to a TeamDTO. */
  public static TeamDto toDto(Team team) {
    return toDto(team, List.of());
  }

  /** Converts a Team entity to a TeamDTO including the registered tournaments. */
  public static TeamDto toDto(Team team, List<String> registeredTournamentNames) {
    if (team == null) {
      return null;
    }
    return new TeamDto(
        team.getId(),
        team.getNom(),
        toResponsibleDto(team.getResponsible()),
        toResponsibleDto(team.getSecondResponsible()),
        registeredTournamentNames);
  }

  /**
   * Helper method to convert a Responsible entity to a ResponsibleDTO.
   */
  private static ResponsibleDto toResponsibleDto(Responsible resp) {
    if (resp == null) {
      return null;
    }
    return new ResponsibleDto(resp.getId(), resp.getMember().getTag());
  }
}
