package be.vinci.ipl.cae.demo.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Exception mapped to HTTP 400.
 */
public class BadRequestException extends ApiException {

  /**
   * Constructs a BadRequestException with HTTP 400 status.
   *
   * @param message the exception message
   */
  public BadRequestException(String message) {
    super(HttpStatus.BAD_REQUEST, message);
  }
}
