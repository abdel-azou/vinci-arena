package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Member.Role;
import be.vinci.ipl.cae.demo.models.entities.Responsible;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.ResponsibleRepository;
import be.vinci.ipl.cae.demo.repositories.TeamJoinRequestRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles transitions when a member leaves a team or moves to another one.
 */
@Service
@Transactional
public class TeamMembershipTransitionService {

  private final MemberRepository memberRepository;
  private final ResponsibleRepository responsibleRepository;
  private final TeamRepository teamRepository;
  private final TeamJoinRequestRepository teamJoinRequestRepository;

  /**
   * Builds the team membership transition service.
   */
  public TeamMembershipTransitionService(
      MemberRepository memberRepository,
      ResponsibleRepository responsibleRepository,
      TeamRepository teamRepository,
      TeamJoinRequestRepository teamJoinRequestRepository) {
    this.memberRepository = memberRepository;
    this.responsibleRepository = responsibleRepository;
    this.teamRepository = teamRepository;
    this.teamJoinRequestRepository = teamJoinRequestRepository;
  }

  /**
   * Detaches a member from the current team while preserving team consistency.
   */
  public void detachMemberFromCurrentTeam(Member member) {
    Team currentTeam = member.getTeam();
    if (currentTeam == null) {
      return;
    }

    Team mainResponsibleTeam = teamRepository.findByResponsibleMemberId(member.getId());
    Team secondResponsibleTeam = teamRepository.findBySecondResponsibleMemberId(member.getId());
    boolean isMainResponsible = mainResponsibleTeam != null
        && mainResponsibleTeam.getId().equals(currentTeam.getId());
    boolean isSecondResponsible = secondResponsibleTeam != null
        && secondResponsibleTeam.getId().equals(currentTeam.getId());
    List<Member> teamMembers = memberRepository.findByTeamId(currentTeam.getId());

    if (isMainResponsible) {
      List<Member> remainingMembers = teamMembers.stream()
          .filter(teamMember -> !teamMember.getId().equals(member.getId()))
          .sorted(Comparator
              .comparing(Member::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
              .thenComparing(Member::getId))
          .toList();

      if (!remainingMembers.isEmpty()) {
        Member nextResponsibleMember = resolveNextResponsibleMember(currentTeam, remainingMembers);
        Responsible nextResponsible = ensureResponsible(nextResponsibleMember);
        currentTeam.setResponsible(nextResponsible);
        if (currentTeam.getSecondResponsible() != null
            && currentTeam.getSecondResponsible().getMember() != null
            && currentTeam.getSecondResponsible().getMember().getId()
            .equals(nextResponsibleMember.getId())) {
          currentTeam.setSecondResponsible(null);
        }
        if (nextResponsibleMember.getRole() == Role.MEMBER) {
          nextResponsibleMember.setRole(Role.RESPONSIBLE);
        }
        memberRepository.save(nextResponsibleMember);
        teamRepository.save(currentTeam);
      } else {
        currentTeam.setResponsible(null);
        currentTeam.setSecondResponsible(null);
        teamRepository.save(currentTeam);
        teamJoinRequestRepository.deleteAll(
            teamJoinRequestRepository.findByTeamId(currentTeam.getId()));
      }

      member.setTeam(null);
      clearResponsibleRole(member);
      memberRepository.save(member);
      return;
    }

    if (isSecondResponsible) {
      currentTeam.setSecondResponsible(null);
      teamRepository.save(currentTeam);

      member.setTeam(null);
      clearResponsibleRole(member);
      memberRepository.save(member);
      return;
    }

    member.setTeam(null);
    memberRepository.save(member);
  }

  private Member resolveNextResponsibleMember(Team team, List<Member> remainingMembers) {
    if (team.getSecondResponsible() != null && team.getSecondResponsible().getMember() != null) {
      Long secondResponsibleMemberId = team.getSecondResponsible().getMember().getId();
      return remainingMembers.stream()
          .filter(teamMember -> teamMember.getId().equals(secondResponsibleMemberId))
          .findFirst()
          .orElse(remainingMembers.getFirst());
    }
    return remainingMembers.getFirst();
  }

  private Responsible ensureResponsible(Member member) {
    Responsible responsible = member.getResponsible();
    if (responsible == null) {
      responsible = new Responsible();
      responsible.setMember(member);
      member.setResponsible(responsible);
      responsibleRepository.save(responsible);
    }
    return responsible;
  }

  private void clearResponsibleRole(Member member) {
    Responsible responsible = member.getResponsible();
    member.setResponsible(null);
    if (member.getRole() == Role.RESPONSIBLE) {
      member.setRole(Role.MEMBER);
    }
    if (responsible != null) {
      responsibleRepository.delete(responsible);
    }
  }
}
