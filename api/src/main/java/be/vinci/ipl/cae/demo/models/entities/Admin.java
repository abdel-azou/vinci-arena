package be.vinci.ipl.cae.demo.models.entities;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;



/**
 * Entity representing an Admin in the Vinci Arena system.
 * An Admin is associated with a Member.
 */
@Entity
@Table(name = "admins")
public class Admin {
  @Id
  private Long id;

  @OneToOne
  @JoinColumn(name = "member_id")
  private Member member;

  /**
   * empty contructor admin.
   */
  public Admin() {
    // left blank for JSON deserialization
  }

  /**
   * contructor admin.
   */
  public Admin(Long id, Member member) {
    this.id = id;
    this.member = member;
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
}
