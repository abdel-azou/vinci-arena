package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.ApiException;
import be.vinci.ipl.cae.demo.models.dtos.AdminRoleRequest;
import be.vinci.ipl.cae.demo.models.dtos.AdminRoleUpdateResponse;
import be.vinci.ipl.cae.demo.models.dtos.AdminSummaryDto;
import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedMember;
import be.vinci.ipl.cae.demo.models.dtos.ChangePasswordRequest;
import be.vinci.ipl.cae.demo.models.dtos.MessageResponse;
import be.vinci.ipl.cae.demo.models.dtos.PublicMemberDto;
import be.vinci.ipl.cae.demo.models.dtos.UpdateProfileImageRequest;
import be.vinci.ipl.cae.demo.models.dtos.UpdateSpecialtyRequest;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Member.Role;
import be.vinci.ipl.cae.demo.services.MemberAdministrationService;
import be.vinci.ipl.cae.demo.services.MemberProfileService;
import be.vinci.ipl.cae.demo.services.MemberService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Refresh JWT pour remember me auto-login (30j TTL).
 */
@RestController
@RequestMapping("/members")
public class MemberController {

  private final MemberService memberService;
  private final MemberAdministrationService memberAdministrationService;
  private final MemberProfileService memberProfileService;

  /**
   * Constructor for `MemberController`.
   *
   * @param memberService the service handling member-related operations
   */
  public MemberController(
      MemberService memberService,
      MemberAdministrationService memberAdministrationService,
      MemberProfileService memberProfileService) {
    this.memberService = memberService;
    this.memberAdministrationService = memberAdministrationService;
    this.memberProfileService = memberProfileService;
  }

  /**
   * Returns all members sorted alphabetically by tag.
   * Accessible without authentication.
   *
   * @return list of public member profiles
   */
  @GetMapping
  public List<PublicMemberDto> getAllMembers() {
    return memberProfileService.getAllMembersSortedByTag();
  }

  /**
   * Rafraîchit JWT (30j). Appelé au démarrage app si token localStorage valide.
   * Frontend: GET /members/me -> Authorization: old-token
   */
  @GetMapping("/me")
  @PreAuthorize("isAuthenticated()")
  public AuthenticatedMember me() {
    Member member = (Member) SecurityContextHolder.getContext()
        .getAuthentication().getPrincipal();
    Member refreshedMember = memberService.refreshCurrentMember(member);
    return memberService.createJwtToken(refreshedMember, true);
  }

  /**
   * Changes the password of the authenticated member.
   *
   * @param request contains current and new password
   * @return success message
   */
  @PatchMapping("/me/password")
  @PreAuthorize("isAuthenticated()")
  public MessageResponse changeMyPassword(@Valid @RequestBody ChangePasswordRequest request) {
    try {
      Member member = (Member) SecurityContextHolder.getContext()
          .getAuthentication().getPrincipal();

      memberProfileService.changePassword(
          member.getEmail(),
          request.currentPassword(),
          request.newPassword());

      return new MessageResponse("Mot de passe mis à jour");
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
   * Updates the specialty of the authenticated member.
   *
   * @param request contains the new specialty
   * @return the updated authenticated member with new JWT
   */
  @PatchMapping("/me/specialty")
  @PreAuthorize("isAuthenticated()")
  public AuthenticatedMember updateMySpecialty(@Valid @RequestBody UpdateSpecialtyRequest request) {
    try {
      Member member = (Member) SecurityContextHolder.getContext()
          .getAuthentication().getPrincipal();

      Member updatedMember = memberProfileService.updateSpecialty(
          member.getEmail(),
          request.specialty());

      return memberService.createJwtToken(updatedMember, true);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
   * Updates the profile image of the authenticated member.
   *
   * @param request contains the new profile image file name
   * @return the updated authenticated member with new JWT
   */
  @PatchMapping("/me/profile-image")
  @PreAuthorize("isAuthenticated()")
  public AuthenticatedMember updateMyProfileImage(
      @Valid @RequestBody UpdateProfileImageRequest request) {
    try {
      Member member = (Member) SecurityContextHolder.getContext()
          .getAuthentication().getPrincipal();

      Member updatedMember = memberProfileService.updateProfileImage(
          member.getEmail(),
          request.profileImage());

      return memberService.createJwtToken(updatedMember, true);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
   * Lists current admins.
   *
   * @return admin summaries
   */
  @GetMapping("/admin")
  @PreAuthorize("hasRole('ADMIN')")
  public List<AdminSummaryDto> listAdmins() {
    Member currentAdmin = (Member) SecurityContextHolder.getContext()
        .getAuthentication().getPrincipal();

    return memberAdministrationService.listAdmins(currentAdmin).stream()
        .map(member -> new AdminSummaryDto(member.getId(), member.getTag(), member.getEmail()))
        .toList();
  }

  /**
   * Promotes a member to admin role.
   *
   * @param request contains the target member email
   * @return success message and resulting role
   */
  @PostMapping("/admin")
  @PreAuthorize("hasRole('ADMIN')")
  public AdminRoleUpdateResponse promoteMemberToAdmin(
      @Valid @RequestBody AdminRoleRequest request) {
    Member currentAdmin = (Member) SecurityContextHolder.getContext()
        .getAuthentication().getPrincipal();
    try {
      Role role = memberAdministrationService.promoteToAdmin(request.email(), currentAdmin);
      return new AdminRoleUpdateResponse("Statut admin attribue", role);
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Removes admin role from a member.
   *
   * @param request contains the target member email
   * @return success message and resulting role
   */
  @DeleteMapping("/admin")
  @PreAuthorize("hasRole('ADMIN')")
  public AdminRoleUpdateResponse removeMemberAdminRole(
      @Valid @RequestBody AdminRoleRequest request) {
    Member currentAdmin = (Member) SecurityContextHolder.getContext()
        .getAuthentication().getPrincipal();
    try {
      Role role = memberAdministrationService.removeAdminRole(request.email(), currentAdmin);
      return new AdminRoleUpdateResponse("Statut admin retire", role);
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Searches for non-admin members by email or tag.
   *
   * @param query the search term
   * @return list of matching members (non-admin only)
   */
  @GetMapping("/search")
  @PreAuthorize("hasRole('ADMIN')")
  public List<AdminSummaryDto> searchMembers(@RequestParam String query) {
    Member currentAdmin = (Member) SecurityContextHolder.getContext()
        .getAuthentication().getPrincipal();
    try {
      return memberAdministrationService.searchMembers(query, currentAdmin).stream()
          .map(member -> new AdminSummaryDto(member.getId(), member.getTag(), member.getEmail()))
          .toList();
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.FORBIDDEN);
    }
  }

  /**
   * Returns the public profile of a member by their id.
   *
   * @param id the member id
   * @return the public member profile
   */
  @GetMapping("/{id}")
  public PublicMemberDto getMemberById(@PathVariable Long id) {
    try {
      return memberProfileService.getMemberById(id);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    }
  }

  /**
   * Returns all matches for a member in a specific tournament.
   *
   * @param id the member id
   * @param tournamentId the tournament id
   * @return list of matches where member participates
   */
  @GetMapping("/{id}/tournaments/{tournamentId}/matches")
  public List<be.vinci.ipl.cae.demo.models.dtos.TournamentMatchDto> getMemberTournamentMatches(
      @PathVariable Long id,
      @PathVariable Long tournamentId) {
    try {
      return memberProfileService.getMemberTournamentMatches(id, tournamentId);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    }
  }

  /**
   * Bans a member from the platform (admin only).
   *
   * @param id the member id to ban
   */
  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public void banMember(@PathVariable Long id) {
    Member currentAdmin = (Member) SecurityContextHolder.getContext()
        .getAuthentication().getPrincipal();
    try {
      memberAdministrationService.banMember(id, currentAdmin);
    } catch (IllegalArgumentException e) {
      throw mapIllegalArgument(e, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Unbans a previously banned member (admin only).
   *
   * @param id the member id to unban
   */
  @PatchMapping("/{id}/unban")
  @PreAuthorize("hasRole('ADMIN')")
  public void unbanMember(@PathVariable Long id) {
    Member currentAdmin = (Member) SecurityContextHolder.getContext()
        .getAuthentication().getPrincipal();
    try {
      memberAdministrationService.unbanMember(id, currentAdmin);
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
