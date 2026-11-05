package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.ApiException;
import be.vinci.ipl.cae.demo.models.dtos.MessageResponse;
import be.vinci.ipl.cae.demo.models.dtos.RespondToMatchResultRequest;
import be.vinci.ipl.cae.demo.models.dtos.TournamentMatchDto;
import be.vinci.ipl.cae.demo.models.dtos.UpdateMatchResultRequest;
import be.vinci.ipl.cae.demo.models.dtos.UpdateMatchSelectionRequest;
import be.vinci.ipl.cae.demo.models.dtos.UpdateTournamentMatchRequest;
import be.vinci.ipl.cae.demo.models.entities.Member;
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

/**
 * Controller for tournament match planning.
 */
@RestController
@RequestMapping("/tournaments/{tournamentId}/matches")
public class TournamentMatchController {

  private final TournamentService tournamentService;

  /**
   * Constructor.
   *
   * @param tournamentService tournament service
   */
  public TournamentMatchController(TournamentService tournamentService) {
    this.tournamentService = tournamentService;
  }

  /**
   * Generates the planning for a tournament.
   */
  @PostMapping("/generate")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<List<TournamentMatchDto>> generateMatches(
      @PathVariable Long tournamentId,
      @AuthenticationPrincipal Member currentMember) {
    try {
      List<TournamentMatchDto> matches =
          tournamentService.generateTournamentMatches(tournamentId, currentMember);
      return new ResponseEntity<>(matches, HttpStatus.CREATED);
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Returns the matches for a tournament.
   */
  @GetMapping
  public ResponseEntity<List<TournamentMatchDto>> getMatches(
      @PathVariable Long tournamentId,
      @AuthenticationPrincipal Member currentMember) {
    return ResponseEntity.ok(tournamentService.getTournamentMatches(tournamentId, currentMember));
  }

  /**
   * Updates a match before publication.
   */
  @PutMapping("/{matchId}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<TournamentMatchDto> updateMatch(
      @PathVariable Long tournamentId,
      @PathVariable Long matchId,
      @Valid @RequestBody UpdateTournamentMatchRequest request,
      @AuthenticationPrincipal Member currentMember) {
    try {
      TournamentMatchDto updated = tournamentService.updateTournamentMatch(
          tournamentId,
          matchId,
          request,
          currentMember);
      return ResponseEntity.ok(updated);
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Updates one team selection for a published match.
   */
  @PutMapping("/{matchId}/selection")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<TournamentMatchDto> updateMatchSelection(
      @PathVariable Long tournamentId,
      @PathVariable Long matchId,
      @Valid @RequestBody UpdateMatchSelectionRequest request,
      @AuthenticationPrincipal Member currentMember) {
    try {
      TournamentMatchDto updated = tournamentService.updateMatchSelection(
          tournamentId,
          matchId,
          request,
          currentMember);
      return ResponseEntity.ok(updated);
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Encodes a match result.
   */
  @PutMapping("/{matchId}/result")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<TournamentMatchDto> updateMatchResult(
      @PathVariable Long tournamentId,
      @PathVariable Long matchId,
      @Valid @RequestBody UpdateMatchResultRequest request,
      @AuthenticationPrincipal Member currentMember) {
    try {
      TournamentMatchDto updated = tournamentService.updateMatchResult(
          tournamentId,
          matchId,
          request,
          currentMember);
      return ResponseEntity.ok(updated);
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Receives a team response to an encoded result.
   */
  @PostMapping("/{matchId}/result-response")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<TournamentMatchDto> respondToMatchResult(
      @PathVariable Long tournamentId,
      @PathVariable Long matchId,
      @Valid @RequestBody RespondToMatchResultRequest request,
      @AuthenticationPrincipal Member currentMember) {
    try {
      TournamentMatchDto updated = tournamentService.respondToMatchResult(
          tournamentId,
          matchId,
          request,
          currentMember);
      return ResponseEntity.ok(updated);
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Declares a team forfeit before the match date.
   */
  @PostMapping("/{matchId}/forfeit")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<TournamentMatchDto> declareMatchForfeit(
      @PathVariable Long tournamentId,
      @PathVariable Long matchId,
      @AuthenticationPrincipal Member currentMember) {
    try {
      TournamentMatchDto updated = tournamentService.declareMatchForfeit(
          tournamentId,
          matchId,
          currentMember);
      return ResponseEntity.ok(updated);
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Publishes the planning for a tournament.
   */
  @PostMapping("/publish")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<MessageResponse> publishMatches(
      @PathVariable Long tournamentId,
      @AuthenticationPrincipal Member currentMember) {
    try {
      tournamentService.publishTournamentMatches(tournamentId, currentMember);
      return ResponseEntity.ok(new MessageResponse("Planning publié"));
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
