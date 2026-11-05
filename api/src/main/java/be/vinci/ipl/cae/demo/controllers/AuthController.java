package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedMember;
import be.vinci.ipl.cae.demo.models.dtos.Credentials;
import be.vinci.ipl.cae.demo.models.dtos.RegisterRequest;
import be.vinci.ipl.cae.demo.services.MemberService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;


/**
 * REST controller for member authentication (register/login). Endpoints available at
 * /auths/register and /auths/login.
 */
@RestController
@RequestMapping("/auths")  // garde /auths
public class AuthController {

  private final MemberService memberService;

  /**
   * Constructor injection for MemberService dependency.
   *
   * @param memberService handles member business logic
   */
  public AuthController(MemberService memberService) {
    this.memberService = memberService;
  }

  private String validatePassword(String password) {
    if (password.length() < 8) {
      return "Le mot de passe doit contenir au moins 8 caracteres";
    }

    if (!password.matches(".*\\d.*")) {
      return "Le mot de passe doit contenir au moins un chiffre";
    }

    if (!password.matches(".*[^A-Za-z0-9].*")) {
      return "Le mot de passe doit contenir au moins un caractere special";
    }

    return null;
  }

  /**
   * Registers a new member with email, tag, password, and specialty.
   *
   * @param request registration data (email, tag, password, specialty)
   * @return 201 CREATED when the member is successfully created
   */
  @PostMapping("/register")
  public ResponseEntity<Void> register(
      @Valid @RequestBody RegisterRequest request) {
    String passwordValidationError = validatePassword(request.password());
    if (passwordValidationError != null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, passwordValidationError);
    }

    try {
      boolean created = memberService.register(
          request.email(),
          request.tag(),
          request.password(),
          request.specialty(),
          request.profileImage()
      );
      if (!created) {
        throw new ResponseStatusException(HttpStatus.CONFLICT);
      }
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }

    return ResponseEntity.status(HttpStatus.CREATED).build();
  }

  /**
   * Authenticates existing member and returns JWT token. Token expires in 24h (or 30d with
   * rememberMe).
   *
   * @param credentials login data (email, password)
   * @return AuthenticatedMember with JWT token and member info
   */
  @PostMapping("/login")
  public AuthenticatedMember login(@Valid @RequestBody Credentials credentials,
      @RequestParam(value = "rememberMe", defaultValue = "false") boolean rememberMe) {
    try {
      AuthenticatedMember member = memberService.login(
          credentials.email(),
          credentials.password(),
          rememberMe
      );

      if (member == null) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
      }
      return member;
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
    }
  }
}
