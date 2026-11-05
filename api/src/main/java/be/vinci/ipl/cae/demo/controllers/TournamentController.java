package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.ApiException;
import be.vinci.ipl.cae.demo.mappers.TournamentMapper;
import be.vinci.ipl.cae.demo.models.dtos.CreateTournamentRequest;
import be.vinci.ipl.cae.demo.models.dtos.RegisterTeamToTournamentResponse;
import be.vinci.ipl.cae.demo.models.dtos.TournamentDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.TeamTournamentRegistration;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.services.TournamentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Controller for managing tournament-related endpoints. */
@RestController
@RequestMapping("/tournaments")
public class TournamentController {

  private final TournamentService tournamentService;

  /**
   * Constructs a new TournamentController.
   *
   * @param tournamentService service used for tournament operations
   */
  public TournamentController(TournamentService tournamentService) {
    this.tournamentService = tournamentService;
  }

  /** Returns all tournaments. */
  @GetMapping
  public ResponseEntity<List<TournamentDto>> getAllTournaments() {
    return ResponseEntity.ok(tournamentService.getAllTournamentDtos());
  }

  /** Returns draft tournaments for the authenticated admin. */
  @GetMapping("/my-drafts")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<List<TournamentDto>> getMyDraftTournaments(
      @AuthenticationPrincipal Member currentMember) {
    try {
      return ResponseEntity.ok(tournamentService.getMyDraftTournamentDtos(currentMember));
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.BAD_REQUEST);
    }
  }

  /** Returns one tournament. */
  @GetMapping("/{tournamentId}")
  public ResponseEntity<TournamentDto> getTournamentById(@PathVariable Long tournamentId) {
    try {
      return ResponseEntity.ok(tournamentService.getTournamentDtoById(tournamentId));
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    }
  }

  /** Creates a new tournament for the authenticated admin. */
  @PostMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<TournamentDto> createTournament(
      @Valid @RequestBody CreateTournamentRequest request,
      @AuthenticationPrincipal Member currentMember) {
    try {
      Tournament createdTournament = tournamentService.createTournament(request, currentMember);
      return new ResponseEntity<>(TournamentMapper.toDto(createdTournament), HttpStatus.CREATED);
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.BAD_REQUEST);
    }
  }

  /** Updates a draft tournament for the authenticated admin. */
  @PutMapping("/{tournamentId}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<TournamentDto> updateDraftTournament(
      @PathVariable Long tournamentId,
      @Valid @RequestBody CreateTournamentRequest request,
      @AuthenticationPrincipal Member currentMember) {
    try {
      Tournament updatedTournament = tournamentService.updateDraftTournament(
          tournamentId,
          request,
          currentMember);
      return ResponseEntity.ok(TournamentMapper.toDto(updatedTournament));
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.BAD_REQUEST);
    }
  }

  /** Publishes a draft tournament for the authenticated admin. */
  @PostMapping("/{tournamentId}/publish")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<TournamentDto> publishDraftTournament(
      @PathVariable Long tournamentId,
      @AuthenticationPrincipal Member currentMember) {
    try {
      Tournament publishedTournament = tournamentService.publishDraftTournament(
          tournamentId,
          currentMember);
      return ResponseEntity.ok(TournamentMapper.toDto(publishedTournament));
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.BAD_REQUEST);
    }
  }

  /** Registers the authenticated member's team to a tournament. */
  @PostMapping("/{tournamentId}/teams/me")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<RegisterTeamToTournamentResponse> registerMyTeamToTournament(
      @PathVariable Long tournamentId,
      @AuthenticationPrincipal Member currentMember) {
    try {
      TeamTournamentRegistration registration = tournamentService.registerMyTeamToTournament(
          tournamentId,
          currentMember);

      RegisterTeamToTournamentResponse response = new RegisterTeamToTournamentResponse(
          "Équipe inscrite au tournoi",
          registration.getTeam().getId(),
          registration.getTournament().getId());

      return new ResponseEntity<>(response, HttpStatus.CREATED);
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.BAD_REQUEST);
    }
  }

  private ResponseStatusException mapIllegalArgument(
      IllegalArgumentException e,
      HttpStatus defaultStatus) {
    if (e instanceof ApiException apiException) {
      return new ResponseStatusException(apiException.getStatus(), e.getMessage(), e);
    }
    return new ResponseStatusException(defaultStatus, e.getMessage(), e);
  }
}
