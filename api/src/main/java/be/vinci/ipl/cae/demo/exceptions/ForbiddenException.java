package be.vinci.ipl.cae.demo.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Exception mapped to HTTP 403.
 */
public class ForbiddenException extends ApiException {

  /**
   * Constructs a ForbiddenException with HTTP 403 status.
   *
   * @param message the exception message
   */
  public ForbiddenException(String message) {
    super(HttpStatus.FORBIDDEN, message);
  }
}
