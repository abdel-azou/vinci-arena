package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.Member;

/** Response returned after an admin role update. */
public record AdminRoleUpdateResponse(String message, Member.Role role) {
}
