package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * Entity representing a notification.
 */
@Entity
@Table(name = "notifications")
public class Notification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String message;

  @Column(name = "is_read", nullable = false)
  private boolean isRead;

  @Column(name = "sent_at", nullable = false, updatable = false)
  private LocalDateTime sentAt;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "sender_id", nullable = false)
  private Member sender;

  @Column(name = "redirect_link")
  private String redirectLink;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "type_id", nullable = false)
  private NotificationType notificationType;

  /**
   * Default constructor.
   */
  public Notification() {
    // Required by JPA.
  }

  /**
   * Constructor with all fields.
   *
   * @param id notification id
   * @param message notification message
   * @param isRead read flag
   * @param sentAt sent date-time
   * @param sender member sender
   * @param redirectLink optional link
   * @param notificationType notification type
   */
  public Notification(
      Long id,
      String message,
      boolean isRead,
      LocalDateTime sentAt,
      Member sender,
      String redirectLink,
      NotificationType notificationType) {
    this.id = id;
    this.message = message;
    this.isRead = isRead;
    this.sentAt = sentAt;
    this.sender = sender;
    this.redirectLink = redirectLink;
    this.notificationType = notificationType;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public boolean isRead() {
    return isRead;
  }

  public void setRead(boolean read) {
    isRead = read;
  }

  public LocalDateTime getSentAt() {
    return sentAt;
  }

  public void setSentAt(LocalDateTime sentAt) {
    this.sentAt = sentAt;
  }

  public Member getSender() {
    return sender;
  }

  public void setSender(Member sender) {
    this.sender = sender;
  }

  public String getRedirectLink() {
    return redirectLink;
  }

  public void setRedirectLink(String redirectLink) {
    this.redirectLink = redirectLink;
  }

  public NotificationType getNotificationType() {
    return notificationType;
  }

  public void setNotificationType(NotificationType notificationType) {
    this.notificationType = notificationType;
  }

  /**
   * Initializes default values before persisting.
   */
  @PrePersist
  public void onCreate() {
    isRead = false;
    if (sentAt == null) {
      sentAt = LocalDateTime.now();
    }
  }
}
