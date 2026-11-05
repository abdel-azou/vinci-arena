package be.vinci.ipl.cae.demo.mappers;

import be.vinci.ipl.cae.demo.models.dtos.MemberUnavailabilityDto;
import be.vinci.ipl.cae.demo.models.entities.MemberUnavailability;

/**
 * Mapper converting MemberUnavailability entities to DTOs.
 */
public final class MemberUnavailabilityMapper {

  /**
   * Private constructor to prevent instantiation.
   */
  private MemberUnavailabilityMapper() {
  }

  /**
   * Converts a MemberUnavailability entity to a DTO.
   *
   * @param entity the entity to convert
   * @return the corresponding DTO
   */
  public static MemberUnavailabilityDto toDto(MemberUnavailability entity) {
    return new MemberUnavailabilityDto(
        entity.getId(),
        entity.getStartDate(),
        entity.getEndDate());
  }
}
