package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.ApiException;
import be.vinci.ipl.cae.demo.models.dtos.MessageResponse;
import be.vinci.ipl.cae.demo.models.dtos.RejectJoinRequestRequest;
import be.vinci.ipl.cae.demo.models.dtos.TeamJoinRequestSummaryDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.services.TeamJoinRequestService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller for team join request moderation endpoints.
 */
@RestController
public class TeamJoinRequestController {

  private final TeamJoinRequestService teamJoinRequestService;

  /**
   * Constructor.
   */
  public TeamJoinRequestController(TeamJoinRequestService teamJoinRequestService) {
    this.teamJoinRequestService = teamJoinRequestService;
  }

  /**
   * Returns pending join requests for the current responsible's team.
   */
  @GetMapping("/teams/my/join-requests")
  @PreAuthorize("isAuthenticated()")
  public List<TeamJoinRequestSummaryDto> getMyPendingRequests(
      @AuthenticationPrincipal Member currentMember) {
    try {
      return teamJoinRequestService.getPendingRequestsForMyTeam(currentMember).stream()
          .map(req -> new TeamJoinRequestSummaryDto(
              req.getId(),
              req.getStatus().name(),
              req.getMember().getTag(),
              req.getTeam().getId(),
              req.getTeam().getNom()))
          .toList();
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.FORBIDDEN);
    }
  }

  /**
   * Accepts a join request.
   */
  @PatchMapping("/teams/join-requests/{id}/accept")
  @PreAuthorize("isAuthenticated()")
  public MessageResponse acceptRequest(
      @PathVariable Long id,
      @AuthenticationPrincipal Member currentMember) {
    return processDecision(id, currentMember, true, null);
  }

  /**
   * Rejects a join request.
   */
  @PatchMapping("/teams/join-requests/{id}/reject")
  @PreAuthorize("isAuthenticated()")
  public MessageResponse rejectRequest(
      @PathVariable Long id,
      @Valid @RequestBody RejectJoinRequestRequest request,
      @AuthenticationPrincipal Member currentMember) {
    return processDecision(id, currentMember, false, request.reason());
  }

  private MessageResponse processDecision(
      Long id,
      Member currentMember,
      boolean accept,
      String reason) {
    try {
      if (accept) {
        teamJoinRequestService.acceptRequest(id, currentMember);
        return new MessageResponse("Demande acceptée");
      }
      teamJoinRequestService.rejectRequest(id, currentMember, reason);
      return new MessageResponse("Demande refusée");
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
