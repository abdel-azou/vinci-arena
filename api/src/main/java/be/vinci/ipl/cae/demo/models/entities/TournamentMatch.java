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
 * Entity representing a match inside a tournament bracket.
 */
@Entity
@Table(name = "tournament_matches")
public class TournamentMatch {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "tournament_id", nullable = false)
  private Tournament tournament;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "team_a_id", nullable = false)
  private Team teamA;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "team_b_id")
  private Team teamB;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Round round;

  @Column
  private LocalDateTime scheduledDate;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Status status = Status.PLANNED;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "admin_id", nullable = false)
  private Admin administrator;

  @Column(nullable = false)
  private boolean isBye = false;

  @Column
  private Integer teamAlphaScore;

  @Column
  private Integer teamBravoScore;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ResultStatus resultStatus = ResultStatus.NOT_ENCODED;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TeamResultResponse teamAlphaResultResponse = TeamResultResponse.PENDING;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TeamResultResponse teamBravoResultResponse = TeamResultResponse.PENDING;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Tournament getTournament() {
    return tournament;
  }

  public void setTournament(Tournament tournament) {
    this.tournament = tournament;
  }

  public Team getTeamA() {
    return teamA;
  }

  public void setTeamA(Team teamA) {
    this.teamA = teamA;
  }

  public Team getTeamB() {
    return teamB;
  }

  public void setTeamB(Team teamB) {
    this.teamB = teamB;
  }

  public Round getRound() {
    return round;
  }

  public void setRound(Round round) {
    this.round = round;
  }

  public LocalDateTime getScheduledDate() {
    return scheduledDate;
  }

  public void setScheduledDate(LocalDateTime scheduledDate) {
    this.scheduledDate = scheduledDate;
  }

  public Status getStatus() {
    return status;
  }

  public void setStatus(Status status) {
    this.status = status;
  }

  public Admin getAdministrator() {
    return administrator;
  }

  public void setAdministrator(Admin administrator) {
    this.administrator = administrator;
  }

  public boolean isBye() {
    return isBye;
  }

  public void setBye(boolean bye) {
    isBye = bye;
  }

  public Integer getTeamAlphaScore() {
    return teamAlphaScore;
  }

  public void setTeamAlphaScore(Integer teamAlphaScoreValue) {
    this.teamAlphaScore = teamAlphaScoreValue;
  }

  public Integer getTeamBravoScore() {
    return teamBravoScore;
  }

  public void setTeamBravoScore(Integer teamBravoScoreValue) {
    this.teamBravoScore = teamBravoScoreValue;
  }

  public ResultStatus getResultStatus() {
    return resultStatus;
  }

  public void setResultStatus(ResultStatus resultStatus) {
    this.resultStatus = resultStatus;
  }

  public TeamResultResponse getTeamAlphaResultResponse() {
    return teamAlphaResultResponse;
  }

  public void setTeamAlphaResultResponse(TeamResultResponse teamAlphaResponse) {
    this.teamAlphaResultResponse = teamAlphaResponse;
  }

  public TeamResultResponse getTeamBravoResultResponse() {
    return teamBravoResultResponse;
  }

  public void setTeamBravoResultResponse(TeamResultResponse teamBravoResponse) {
    this.teamBravoResultResponse = teamBravoResponse;
  }

  /**
   * Round for a tournament match.
   */
  public enum Round {
    PREMIER_TOUR,
    FINAL,
    SEMI_FINAL,
    QUARTER_FINAL,
    ROUND_OF_16,
    ROUND_OF_32,
    ROUND_OF_64,
    ROUND_OF_128
  }

  /**
   * Status of a tournament match.
   */
  public enum Status {
    PLANNED,
    PUBLISHED,
    COMPLETED
  }

  /**
   * Result validation status for a tournament match.
   */
  public enum ResultStatus {
    NOT_ENCODED,
    PENDING_CONFIRMATION,
    CONFIRMED,
    DISPUTED
  }

  /**
   * Response of one team to an encoded result.
   */
  public enum TeamResultResponse {
    PENDING,
    CONFIRMED,
    CORRECTED,
    REFUSED
  }
}
