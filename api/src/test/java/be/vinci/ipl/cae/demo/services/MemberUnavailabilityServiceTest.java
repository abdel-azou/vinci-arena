package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.MemberUnavailability;
import be.vinci.ipl.cae.demo.repositories.MemberUnavailabilityRepository;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for {@link MemberUnavailabilityService}.
 */
@ExtendWith(MockitoExtension.class)
class MemberUnavailabilityServiceTest {

  @Mock
  private MemberUnavailabilityRepository repository;

  @InjectMocks
  private MemberUnavailabilityService service;

  @Test
  void create_WithOverlappingDates_ThrowsException() {
    Member member = new Member();
    member.setId(1L);

    LocalDate baseDate = LocalDate.now().plusDays(10);

    MemberUnavailability existing = new MemberUnavailability();
    existing.setStartDate(baseDate);
    existing.setEndDate(baseDate.plusDays(2));

    when(repository.findByMemberId(1L)).thenReturn(List.of(existing));

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> service.create(
            member,
          baseDate.plusDays(1),
          baseDate.plusDays(3)));

    assertEquals("Cette période chevauche une indisponibilité existante", exception.getMessage());
    verify(repository, never()).save(any(MemberUnavailability.class));
  }

  @Test
  void create_WithPastDates_ThrowsException() {
    Member member = new Member();
    member.setId(1L);

    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> service.create(
            member,
            LocalDate.now().minusDays(1),
            LocalDate.now().plusDays(1)));

    assertEquals(
        "Les dates d'indisponibilité ne peuvent pas être antérieures à aujourd'hui",
        exception.getMessage());
    verify(repository, never()).save(any(MemberUnavailability.class));
  }

  @Test
  void create_WithNonOverlappingDates_SavesUnavailability() {
    Member member = new Member();
    member.setId(1L);

    LocalDate baseDate = LocalDate.now().plusDays(10);

    MemberUnavailability existing = new MemberUnavailability();
    existing.setStartDate(baseDate);
    existing.setEndDate(baseDate.plusDays(2));

    when(repository.findByMemberId(1L)).thenReturn(List.of(existing));
    when(repository.save(any(MemberUnavailability.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    MemberUnavailability created = service.create(
        member,
        baseDate.plusDays(3),
        baseDate.plusDays(5));

    assertEquals(baseDate.plusDays(3), created.getStartDate());
    assertEquals(baseDate.plusDays(5), created.getEndDate());
    verify(repository).save(any(MemberUnavailability.class));
  }
}
