package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.Member.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

/**
 * AuthenticatedMember DTO.
 */
public record AuthenticatedMember(
    Long id,
    String tag,
    String email,
    String token,
    LocalDateTime createdAt,
    String specialty,
    String profileImage,
    Role role,
    Long teamId,
    @JsonProperty("isResponsible") boolean isResponsible) {
}
