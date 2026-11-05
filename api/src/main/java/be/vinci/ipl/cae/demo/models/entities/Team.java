package be.vinci.ipl.cae.demo.models.entities;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entity representing a team in the system. Each team has a unique name and is associated with one
 * or two responsible individuals.
 *
 * <p>This class maps to the "teams" table in the database and includes relationships to the
 * Responsible entity for both the primary and secondary responsible persons.
 */
@Entity
@Table(name = "teams")
public class Team {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private String nom;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "responsible_id")
  private Responsible responsible;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "second_responsible_id")
  private Responsible secondResponsible;

  // TODO: Champs bonus ? (logoUrl, etc.)

  /**
   * empty contructor team.
   */
  public Team() {
    // left blank for JSON deserialization
  }

  /**
   *  contructor team.
   */
  public Team(Long id, String nom, Responsible responsible, Responsible secondResponsible) {
    this.id = id;
    this.nom = nom;
    this.responsible = responsible;
    this.secondResponsible = secondResponsible;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }


  public String getNom() {
    return nom;
  }

  public void setNom(String nom) {
    this.nom = nom;
  }

  public Responsible getResponsible() {
    return responsible;
  }

  public void setResponsible(Responsible responsible) {
    this.responsible = responsible;
  }

  public Responsible getSecondResponsible() {
    return secondResponsible;
  }

  public void setSecondResponsible(Responsible secondResponsible) {
    this.secondResponsible = secondResponsible;
  }
}

