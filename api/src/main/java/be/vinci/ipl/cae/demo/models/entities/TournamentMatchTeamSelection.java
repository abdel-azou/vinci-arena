package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Stores the selected players for one team in one published match.
 */
@Entity
@Table(
    name = "tournament_match_team_selections",
    uniqueConstraints = {
      @UniqueConstraint(columnNames = {"match_id", "team_id"})
    })
public class TournamentMatchTeamSelection {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "match_id", nullable = false)
  private TournamentMatch match;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "team_id", nullable = false)
  private Team team;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "tournament_match_team_selection_players",
      joinColumns = @JoinColumn(name = "selection_id"),
      inverseJoinColumns = @JoinColumn(name = "member_id"))
  private Set<Member> players = new LinkedHashSet<>();

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public TournamentMatch getMatch() {
    return match;
  }

  public void setMatch(TournamentMatch match) {
    this.match = match;
  }

  public Team getTeam() {
    return team;
  }

  public void setTeam(Team team) {
    this.team = team;
  }

  public Set<Member> getPlayers() {
    return players;
  }

  public void setPlayers(Set<Member> players) {
    this.players = players;
  }
}
