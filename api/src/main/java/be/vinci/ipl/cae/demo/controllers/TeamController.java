package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.ApiException;
import be.vinci.ipl.cae.demo.mappers.TeamMapper;
import be.vinci.ipl.cae.demo.models.dtos.AssignSecondResponsibleRequest;
import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedMember;
import be.vinci.ipl.cae.demo.models.dtos.CreateTeamRequest;
import be.vinci.ipl.cae.demo.models.dtos.MemberDto;
import be.vinci.ipl.cae.demo.models.dtos.MessageResponse;
import be.vinci.ipl.cae.demo.models.dtos.TeamDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.services.MemberService;
import be.vinci.ipl.cae.demo.services.TeamJoinRequestService;
import be.vinci.ipl.cae.demo.services.TeamService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Controller for managing team-related endpoints. */
@RestController
@RequestMapping("/teams")
public class TeamController {

  private final MemberService memberService;
  private final TeamService teamService;
  private final TeamJoinRequestService teamJoinRequestService;

  /**
   * Constructs a new TeamController.
   *
   * @param memberService service used for member-related operations
   * @param teamService service used for team operations
   * @param teamJoinRequestService service used for join request operations
   */
  public TeamController(
      MemberService memberService,
      TeamService teamService,
      TeamJoinRequestService teamJoinRequestService) {
    this.memberService = memberService;
    this.teamService = teamService;
    this.teamJoinRequestService = teamJoinRequestService;
  }

  /** Returns all teams. */
  @GetMapping
  public List<TeamDto> getTeams() {
    return teamService.findAllTeamDtos();
  }

  /** Creates a team for the currently authenticated member. */
  @PostMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<TeamDto> createTeam(
      @Valid @RequestBody CreateTeamRequest request,
      @AuthenticationPrincipal Member currentMember) {
    try {
      Team createdTeam = memberService.createTeamForCurrent(request, currentMember);
      TeamDto responseDto = TeamMapper.toDto(createdTeam);
      return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.BAD_REQUEST);
    }
  }

  /** Creates a join request for the currently authenticated member. */
  @PostMapping("/{teamId}/join-requests")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<MessageResponse> createJoinRequest(
      @PathVariable Long teamId,
      @AuthenticationPrincipal Member currentMember) {
    try {
      teamJoinRequestService.createJoinRequest(teamId, currentMember);
      return new ResponseEntity<>(
          new MessageResponse("Demande d'adhésion envoyée"),
          HttpStatus.CREATED);
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.CONFLICT);
    }
  }

  /** Allows the authenticated member to leave their current team. */
  @DeleteMapping("/members/me")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<AuthenticatedMember> leaveTeam(
      @AuthenticationPrincipal Member currentMember) {
    try {
      return ResponseEntity.ok(memberService.leaveTeam(currentMember));
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /** Returns the members of a specific team. */
  @GetMapping("/{teamId}/members")
  public List<MemberDto> getTeamMembers(@PathVariable Long teamId) {
    List<Member> members = teamService.getTeamMembers(teamId);

    return members.stream()
        .map(member -> new MemberDto(
            member.getId(),
            member.getTag(),
            member.getSpecialty().getCode(),
            member.getRole()))
        .toList();
  }

  /** Assigns or replaces the second responsible for the current member team. */
  @PatchMapping("/my/second-responsible")
  @PreAuthorize("isAuthenticated()")
  public TeamDto assignSecondResponsible(
      @Valid @RequestBody AssignSecondResponsibleRequest request,
      @AuthenticationPrincipal Member currentMember) {
    try {
      Team updatedTeam = teamService.assignSecondResponsible(request.memberId(), currentMember);
      return TeamMapper.toDto(updatedTeam);
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
