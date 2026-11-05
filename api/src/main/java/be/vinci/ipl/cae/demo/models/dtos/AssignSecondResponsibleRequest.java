package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.NotNull;

/** Request used to assign or replace a team's second responsible. */
public record AssignSecondResponsibleRequest(@NotNull Long memberId) {
}
