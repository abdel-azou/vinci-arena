package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.mappers.MemberUnavailabilityMapper;
import be.vinci.ipl.cae.demo.models.dtos.MemberUnavailabilityDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.MemberUnavailability;
import be.vinci.ipl.cae.demo.services.MemberUnavailabilityService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller managing the unavailabilities of the authenticated member.
 */
@RestController
@RequestMapping("/members/me/unavailabilities")
public class MemberUnavailabilityController {

  private final MemberUnavailabilityService service;

  /**
   * Constructor.
   *
   * @param service the unavailability service
   */
  public MemberUnavailabilityController(MemberUnavailabilityService service) {
    this.service = service;
  }

  /**
   * Returns all unavailabilities of the authenticated member.
   *
   * @param member the authenticated member
   * @return list of unavailabilities
   */
  @GetMapping
  @PreAuthorize("isAuthenticated()")
  public List<MemberUnavailabilityDto> getMyUnavailabilities(
      @AuthenticationPrincipal Member member) {

    return service.findForMember(member)
        .stream()
        .map(MemberUnavailabilityMapper::toDto)
        .toList();
  }

  /**
   * Creates a new unavailability.
   *
   * @param member the authenticated member
   * @param dto    the unavailability to create
   * @return the created unavailability
   */
  @PostMapping
  @PreAuthorize("isAuthenticated()")
  @ResponseStatus(HttpStatus.CREATED)
  public MemberUnavailabilityDto create(
      @AuthenticationPrincipal Member member,
      @Valid @RequestBody MemberUnavailabilityDto dto) {

    try {
      MemberUnavailability created =
          service.create(member, dto.startDate(), dto.endDate());

      return MemberUnavailabilityMapper.toDto(created);

    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
   * Deletes an unavailability.
   *
   * @param id     the unavailability id
   * @param member the authenticated member
   */
  @DeleteMapping("/{id}")
  @PreAuthorize("isAuthenticated()")
  public void delete(
      @PathVariable Long id,
      @AuthenticationPrincipal Member member) {

    service.delete(id, member);
  }
}
