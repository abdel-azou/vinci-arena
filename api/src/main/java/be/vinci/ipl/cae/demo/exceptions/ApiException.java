package be.vinci.ipl.cae.demo.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Base exception carrying an HTTP status for API responses.
 */
public class ApiException extends IllegalArgumentException {

  private final HttpStatus status;

  /**
   * Constructs an ApiException with the specified status and message.
   *
   * @param status the HTTP status code
   * @param message the exception message
   */
  public ApiException(HttpStatus status, String message) {
    super(message);
    this.status = status;
  }

  public HttpStatus getStatus() {
    return status;
  }
}
