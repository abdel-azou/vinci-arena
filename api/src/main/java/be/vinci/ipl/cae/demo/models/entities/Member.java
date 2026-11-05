package be.vinci.ipl.cae.demo.models.entities;


import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;


/**
 * Entity representing a Member in the Vinci Arena system.
 * A Member has a unique email, tag, password hash, and specialty.
 * It can be associated with a Responsible or Admin entity.
 */
@Entity
@Table(
    name = "members",
    uniqueConstraints = {
      @UniqueConstraint(columnNames = {"team_id", "tag"})
    })

public class Member {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private String email;

  @Column(nullable = false)
  private String tag;

  @Column(nullable = false)
  private String passwordHash; // BCrypt

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "specialty_id", nullable = false)
  private Specialty specialty;

  @Column
  private String profileImage;

  /**
   * Role of the member in the system. It can be MEMBER, RESPONSIBLE, or ADMIN.
   * This field is used to determine the permissions and access level of the member.
   */
  public enum Role { MEMBER, RESPONSIBLE, ADMIN }

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Role role = Role.MEMBER;

  @Column(updatable = false)
  @CreatedDate
  private LocalDateTime createdAt;

  @Column
  private LocalDateTime bannedAt;


  @OneToOne(mappedBy = "member", cascade = CascadeType.ALL)
  private Responsible responsible;

  @OneToOne(mappedBy = "member", cascade = CascadeType.ALL)
  private Admin admin;


  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "team_id")
  private Team team;

  /**
   * empty contructor member.
   */
  public Member() {
    // left blank for JSON deserialization
  }

  /**
   *  contructor member.
   */
  public Member(Long id, String email, String tag, String passwordHash,
                Specialty specialty, String profileImage, Role role, LocalDateTime createdAt,
                LocalDateTime bannedAt, Responsible responsible, Admin admin, Team team) {
    this.id = id;
    this.email = email;
    this.tag = tag;
    this.passwordHash = passwordHash;
    this.specialty = specialty;
    this.profileImage = profileImage;
    this.role = role;
    this.createdAt = createdAt;
    this.bannedAt = bannedAt;
    this.responsible = responsible;
    this.admin = admin;
    this.team = team;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getTag() {
    return tag;
  }

  public void setTag(String tag) {
    this.tag = tag;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public Specialty getSpecialty() {
    return specialty;
  }

  public void setSpecialty(Specialty specialty) {
    this.specialty = specialty;
  }

  public String getProfileImage() {
    return profileImage;
  }

  public void setProfileImage(String profileImage) {
    this.profileImage = profileImage;
  }

  public Role getRole() {
    return role;
  }

  public void setRole(Role role) {
    this.role = role;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public LocalDateTime getBannedAt() {
    return bannedAt;
  }

  public void setBannedAt(LocalDateTime bannedAt) {
    this.bannedAt = bannedAt;
  }

  /**
   * Returns true if the member is banned.
   */
  public boolean isBanned() {
    return bannedAt != null;
  }

  public Responsible getResponsible() {
    return responsible;
  }

  public void setResponsible(Responsible responsible) {
    this.responsible = responsible;
  }

  public Admin getAdmin() {
    return admin;
  }

  public void setAdmin(Admin admin) {
    this.admin = admin;
  }

  public Team getTeam() {
    return team;
  }

  public void setTeam(Team team) {
    this.team = team;
  }
}
