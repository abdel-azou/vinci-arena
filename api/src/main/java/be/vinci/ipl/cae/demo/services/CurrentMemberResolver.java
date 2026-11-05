package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import org.springframework.stereotype.Component;

/**
 * Resolves the current authenticated member from database.
 */
@Component
public class CurrentMemberResolver {

  private final MemberRepository memberRepository;

  /**
   * Creates a resolver backed by the member repository.
   *
   * @param memberRepository repository used to refresh the authenticated member
   */
  public CurrentMemberResolver(MemberRepository memberRepository) {
    this.memberRepository = memberRepository;
  }

  /**
   * Resolves member primarily by email and falls back to tag for legacy tokens.
   * Loads the team association to avoid lazy loading issues.
   */
  public Member resolve(Member currentMember) {
    if (currentMember == null) {
      return null;
    }

    Member member = null;
    if (currentMember.getEmail() != null && !currentMember.getEmail().isBlank()) {
      member = memberRepository.findByEmailWithTeam(currentMember.getEmail());
    }

    if (member == null && currentMember.getTag() != null && !currentMember.getTag().isBlank()) {
      member = memberRepository.findByTagWithTeam(currentMember.getTag());
    }

    return member;
  }
}
