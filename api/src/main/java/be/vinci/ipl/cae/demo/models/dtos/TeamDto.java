package be.vinci.ipl.cae.demo.models.dtos;

import java.util.List;

/** Data transfer object representing a team. */
public record TeamDto(
    Long id,
    String nom,
    ResponsibleDto responsible,
    ResponsibleDto secondResponsible,
    List<String> registeredTournamentNames) {
}
