package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.Member.Role;

/**
 * DTO representing a team member summary.
 */
public record MemberDto(Long id, String tag, String specialty, Role role) {
}
