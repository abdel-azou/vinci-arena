package be.vinci.ipl.cae.demo.models.dtos;

/**
 * Response returned after registering a team to a tournament.
 */
public record RegisterTeamToTournamentResponse(
    String message,
    Long teamId,
    Long tournamentId) {
}
