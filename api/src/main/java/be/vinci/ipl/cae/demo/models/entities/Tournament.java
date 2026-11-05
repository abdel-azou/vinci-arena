package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * Entity representing a tournament in the system.
 */
@Entity
@Table(name = "tournaments")
public class Tournament {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private String name;

  @Column(nullable = false, length = 2000)
  private String description;

  @Column
  private String winnerTeamName;

  @Column(nullable = false)
  private LocalDateTime startDate;

  @Column(nullable = false)
  private LocalDateTime endDate;

  @Column(nullable = false)
  private LocalDateTime registrationDeadline;

  @Column(nullable = false)
  private Integer maxTeams = 16;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TournamentStatus status = TournamentStatus.PREPARATION;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "admin_id", nullable = false)
  private Admin administrator;

  /**
   * empty constructor tournament.
   */
  public Tournament() {
    // left blank for JSON deserialization
  }

  /**
   * constructor tournament.
   */
  public Tournament(Long id, String name, String description, String winnerTeamName,
                    LocalDateTime startDate,
                    LocalDateTime endDate, LocalDateTime registrationDeadline,
                    Integer maxTeams, TournamentStatus status, Admin administrator) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.winnerTeamName = winnerTeamName;
    this.startDate = startDate;
    this.endDate = endDate;
    this.registrationDeadline = registrationDeadline;
    this.maxTeams = maxTeams;
    this.status = status;
    this.administrator = administrator;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getWinnerTeamName() {
    return winnerTeamName;
  }

  public void setWinnerTeamName(String winnerTeamName) {
    this.winnerTeamName = winnerTeamName;
  }

  public LocalDateTime getStartDate() {
    return startDate;
  }

  public void setStartDate(LocalDateTime startDate) {
    this.startDate = startDate;
  }

  public LocalDateTime getEndDate() {
    return endDate;
  }

  public void setEndDate(LocalDateTime endDate) {
    this.endDate = endDate;
  }

  public LocalDateTime getRegistrationDeadline() {
    return registrationDeadline;
  }

  public void setRegistrationDeadline(LocalDateTime registrationDeadline) {
    this.registrationDeadline = registrationDeadline;
  }

  public Integer getMaxTeams() {
    return maxTeams;
  }

  public void setMaxTeams(Integer maxTeams) {
    this.maxTeams = maxTeams;
  }

  public TournamentStatus getStatus() {
    return status;
  }

  public void setStatus(TournamentStatus status) {
    this.status = status;
  }

  public Admin getAdministrator() {
    return administrator;
  }

  public void setAdministrator(Admin administrator) {
    this.administrator = administrator;
  }
}
