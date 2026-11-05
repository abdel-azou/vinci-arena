package be.vinci.ipl.cae.demo.configuration;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.services.MemberService;
import io.micrometer.common.lang.NonNull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * JwtAuthenticationFilter to handle user authentication.
 */
@Configuration
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final MemberService userService;

  /**
   * Constructor for JwtAuthenticationFilter.
   *
   * @param memberService the injected MemberService.
   */
  public JwtAuthenticationFilter(MemberService memberService) {
    this.userService = memberService;
  }

  /**
   * Filter to handle user authentication.
   *
   * @param request     the request.
   * @param response    the response.
   * @param filterChain the filter chain.
   * @throws ServletException the servlet exception.
   * @throws IOException      the IO exception. rolestring is used to determine the role of the user
   *                          and set the appropriate authorities for Spring Security.
   */
  @Override
  protected void doFilterInternal(HttpServletRequest request, @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain) throws ServletException, IOException {
    String token = request.getHeader("Authorization");
    if (token != null) {
      String email = userService.verifyJwtToken(token);
      if (email != null) {
        Member user = userService.readOneFromEmail(email);
        if (user != null && !user.isBanned()) {
          String roleStr = switch (user.getRole()) {
            case ADMIN -> "ROLE_ADMIN";
            case RESPONSIBLE -> "ROLE_RESPONSIBLE";
            case MEMBER -> "ROLE_MEMBER";
            default -> null;
          };

          if (roleStr != null) {
            List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(roleStr));
            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    user, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
          }
        }
      }
    }
    filterChain.doFilter(request, response);
  }
}
