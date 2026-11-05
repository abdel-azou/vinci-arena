package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;


/**
 * Entity representing a Responsible in the Vinci Arena system.
 * A Responsible is associated with a Member and optionally a second responsible Member.
 */
@Entity
@Table(name = "responsibles")
public class Responsible {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;


  @OneToOne
  @JoinColumn(name = "member_id")
  private Member member;


  @OneToOne @JoinColumn(name = "second_responsible_id")
  private Member secondResponsible;

  /**
   * empty contructor responsible.
   */
  public Responsible() {
    // left blank for JSON deserialization
  }

  /**
   *  contructor responsible.
   */
  public Responsible(Long id, Member member, Member secondResponsible) {
    this.id = id;
    this.member = member;
    this.secondResponsible = secondResponsible;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Member getMember() {
    return member;
  }

  public void setMember(Member member) {
    this.member = member;
  }

  public Member getSecondResponsible() {
    return secondResponsible;
  }

  public void setSecondResponsible(Member secondResponsible) {
    this.secondResponsible = secondResponsible;
  }
}
