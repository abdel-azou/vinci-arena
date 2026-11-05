package be.vinci.ipl.cae.demo.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Exception mapped to HTTP 404.
 */
public class NotFoundException extends ApiException {

  /**
   * Constructs a NotFoundException with HTTP 404 status.
   *
   * @param message the exception message
   */
  public NotFoundException(String message) {
    super(HttpStatus.NOT_FOUND, message);
  }
}
