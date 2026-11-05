package be.vinci.ipl.cae.demo;

import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import be.vinci.ipl.cae.demo.models.entities.Specialty;
import be.vinci.ipl.cae.demo.repositories.NotificationTypeRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialtyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Initializes immutable reference data at application startup.
 */
@Component
@Order(1)
public class DataInitializer implements CommandLineRunner {

  private final NotificationTypeRepository notificationTypeRepository;
  private final SpecialtyRepository specialtyRepository;

  /**
   * Constructor.
   */
  public DataInitializer(
      NotificationTypeRepository notificationTypeRepository,
      SpecialtyRepository specialtyRepository) {
    this.notificationTypeRepository = notificationTypeRepository;
    this.specialtyRepository = specialtyRepository;
  }

  @Override
  public void run(String... args) {
    seedNotificationTypes();
    seedSpecialties();
  }

  private void seedNotificationTypes() {
    if (notificationTypeRepository.count() > 0) {
      return;
    }

    NotificationType adhesion = new NotificationType();
    adhesion.setName("Demande d'adhésion");
    notificationTypeRepository.save(adhesion);

    NotificationType refus = new NotificationType();
    refus.setName("Refus d'adhésion");
    notificationTypeRepository.save(refus);

    NotificationType acceptation = new NotificationType();
    acceptation.setName("Acceptation d'adhésion");
    notificationTypeRepository.save(acceptation);
  }

  private void seedSpecialties() {
    createSpecialtyIfMissing("ARCHITECT", "Architecte");
    createSpecialtyIfMissing("EXECUTOR", "Exécuteur");
    createSpecialtyIfMissing("TACTICIAN", "Tacticien");
    createSpecialtyIfMissing("GUARDIAN", "Gardien");
    createSpecialtyIfMissing("CATALYST", "Catalyseur");
    createSpecialtyIfMissing("DISRUPTOR", "Perturbateur");
    createSpecialtyIfMissing("HEALER", "Guérisseur");
  }

  private void createSpecialtyIfMissing(String code, String label) {
    Specialty specialty = specialtyRepository.findByCode(code).orElseGet(Specialty::new);
    specialty.setCode(code);
    specialty.setLabel(label);
    specialtyRepository.save(specialty);
  }
}
