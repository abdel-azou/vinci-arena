package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.MemberUnavailability;
import be.vinci.ipl.cae.demo.repositories.MemberUnavailabilityRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service managing member unavailabilities.
 */
@Service
public class MemberUnavailabilityService {

  private final MemberUnavailabilityRepository repository;

  /**
   * Constructor.
   *
   * @param repository the repository used to access unavailability data
   */
  public MemberUnavailabilityService(MemberUnavailabilityRepository repository) {
    this.repository = repository;
  }

  /**
   * Returns all unavailabilities for a given member.
   *
   * @param member the member
   * @return the list of unavailabilities
   */
  public List<MemberUnavailability> findForMember(Member member) {
    return repository.findByMemberId(member.getId());
  }

  /**
   * Creates a new unavailability period for a member.
   *
   * @param member the member
   * @param start  the start date
   * @param end    the end date
   * @return the created unavailability
   */
  public MemberUnavailability create(Member member, LocalDate start, LocalDate end) {
    if (start == null || end == null) {
      throw new IllegalArgumentException("Les dates de début et de fin sont obligatoires");
    }

    LocalDate today = LocalDate.now();
    if (start.isBefore(today) || end.isBefore(today)) {
      throw new IllegalArgumentException(
          "Les dates d'indisponibilité ne peuvent pas être antérieures à aujourd'hui");
    }

    if (end.isBefore(start)) {
      throw new IllegalArgumentException("La date de fin doit être après la date de début");
    }

    List<MemberUnavailability> existingUnavailabilities = repository.findByMemberId(member.getId());
    boolean overlapsExistingPeriod = existingUnavailabilities.stream()
        .anyMatch(existing -> !end.isBefore(existing.getStartDate())
            && !start.isAfter(existing.getEndDate()));

    if (overlapsExistingPeriod) {
      throw new IllegalArgumentException(
          "Cette période chevauche une indisponibilité existante");
    }

    MemberUnavailability u = new MemberUnavailability();
    u.setMember(member);
    u.setStartDate(start);
    u.setEndDate(end);

    return repository.save(u);
  }

  /**
   * Deletes an unavailability if it belongs to the given member.
   *
   * @param id     the unavailability id
   * @param member the member requesting deletion
   */
  public void delete(Long id, Member member) {

    MemberUnavailability u = repository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Indisponibilité introuvable"));

    if (!u.getMember().getId().equals(member.getId())) {
      throw new IllegalArgumentException("Action non autorisée");
    }

    repository.delete(u);
  }
}
