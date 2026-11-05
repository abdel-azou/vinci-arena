package be.vinci.ipl.cae.demo.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Exception mapped to HTTP 409.
 */
public class ConflictException extends ApiException {

  /**
   * Constructs a ConflictException with HTTP 409 status.
   *
   * @param message the exception message
   */
  public ConflictException(String message) {
    super(HttpStatus.CONFLICT, message);
  }
}
