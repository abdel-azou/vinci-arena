package be.vinci.ipl.cae.demo.models.dtos;

/** DTO exposing a pending join request in a typed way. */
public record TeamJoinRequestSummaryDto(
    Long id,
    String status,
    String memberTag,
    Long teamId,
    String teamName
) {
}
