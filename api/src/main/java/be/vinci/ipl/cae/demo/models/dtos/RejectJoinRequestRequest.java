package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.NotBlank;

/** Request used to reject a join request with a reason. */
public record RejectJoinRequestRequest(@NotBlank String reason) {
}
