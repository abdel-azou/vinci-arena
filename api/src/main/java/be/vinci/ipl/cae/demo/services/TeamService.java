package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ForbiddenException;
import be.vinci.ipl.cae.demo.exceptions.NotFoundException;
import be.vinci.ipl.cae.demo.mappers.TeamMapper;
import be.vinci.ipl.cae.demo.models.dtos.TeamDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Responsible;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.ResponsibleRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.TeamTournamentRegistrationRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * Service class for managing teams in Vinci Arena.
 */
@Service
@Transactional
public class TeamService {

  private final TeamRepository teamRepository;
  private final ResponsibleRepository responsibleRepository;
  private final MemberRepository memberRepository;
  private final CurrentMemberResolver currentMemberResolver;
  private final TeamTournamentRegistrationRepository teamTournamentRegistrationRepository;

  /**
   * Constructor for TeamService, injecting the necessary repositories.
   */
  public TeamService(
      TeamRepository teamRepository,
      ResponsibleRepository responsibleRepository,
      MemberRepository memberRepository,
      CurrentMemberResolver currentMemberResolver,
      TeamTournamentRegistrationRepository teamTournamentRegistrationRepository) {
    this.teamRepository = teamRepository;
    this.responsibleRepository = responsibleRepository;
    this.memberRepository = memberRepository;
    this.currentMemberResolver = currentMemberResolver;
    this.teamTournamentRegistrationRepository = teamTournamentRegistrationRepository;
  }

  /**
   * Returns all teams.
   */
  public List<Team> findAll() {
    return teamRepository.findAll();
  }

  /**
   * Returns all teams enriched with their registered tournaments.
   */
  public List<TeamDto> findAllTeamDtos() {
    List<Team> teams = teamRepository.findAll();
    Map<Long, List<String>> tournamentNamesByTeamId =
        teamTournamentRegistrationRepository.findAllByOrderByTournamentStartDateAsc()
            .stream()
            .collect(Collectors.groupingBy(
                registration -> registration.getTeam().getId(),
                Collectors.mapping(
                    registration -> registration.getTournament().getName(),
                    Collectors.toList())));

    return teams.stream()
        .map(team -> TeamMapper.toDto(
            team,
            tournamentNamesByTeamId.getOrDefault(team.getId(), List.of())))
        .toList();
  }

  /**
   * Create a new team with the given name, responsible, and optional second responsible. Checks for
   * duplicate team names and validates the second responsible if provided.
   *
   * @param nom                 the name of the team to create.
   * @param responsible         the responsible member for the team.
   * @param secondResponsibleId the ID of the second responsible member (optional).
   */
  public Team createTeam(String nom, Responsible responsible, Long secondResponsibleId) {
    if (teamRepository.existsByNom(nom)) {
      throw new ConflictException("Nom de team déjà utilisé");
    }

    Team team = new Team();
    team.setNom(nom);
    team.setResponsible(responsible);

    if (secondResponsibleId != null) {
      Responsible second = responsibleRepository.findById(secondResponsibleId)
          .orElseThrow(() -> new IllegalArgumentException("Second responsible introuvable"));
      team.setSecondResponsible(second);
    }

    return teamRepository.save(team);
  }

  /**
   * Récupère la liste des membres d'une équipe.
   */
  public List<Member> getTeamMembers(Long teamId) {
    if (!teamRepository.existsById(teamId)) {
      throw new NotFoundException("Équipe introuvable");
    }
    return memberRepository.findByTeamId(teamId);
  }

  /**
   * Assigns or replaces the second responsible of the current member's team.
   */
  public Team assignSecondResponsible(Long memberId, Member currentMember) {
    if (memberId == null) {
      throw new BadRequestException("Le membre cible est obligatoire");
    }

    Member current = currentMemberResolver.resolve(currentMember);
    if (current == null) {
      throw new NotFoundException("Membre introuvable");
    }

    Team team = current.getTeam();
    if (team == null) {
      throw new ForbiddenException("Vous n'êtes dans aucune équipe");
    }

    if (!isTeamResponsible(team, current.getId())) {
      throw new ForbiddenException(
          "Seul un responsable de l'équipe peut nommer un second responsable");
    }

    if (current.getId().equals(memberId)) {
      throw new BadRequestException("Vous ne pouvez pas vous nommer vous-même");
    }

    Member target = memberRepository.findById(memberId)
        .orElseThrow(() -> new NotFoundException("Membre introuvable"));

    if (isMainResponsible(team, target.getId())) {
      throw new ConflictException(
        "Le responsable principal ne peut pas être nommé second responsable");
    }

    if (target.getTeam() == null || !team.getId().equals(target.getTeam().getId())) {
      throw new BadRequestException("Le membre doit appartenir à votre équipe");
    }

    boolean currentIsMainResponsible = isMainResponsible(team, current.getId());
    Responsible currentSecondResponsible = team.getSecondResponsible();
    Responsible currentMainResponsible = team.getResponsible();

    if (currentIsMainResponsible) {
      if (currentSecondResponsible != null
          && currentSecondResponsible.getMember() != null
          && !currentSecondResponsible.getMember().getId().equals(target.getId())) {
        Member oldSecondMember = currentSecondResponsible.getMember();
        assignRoleIfNotAdmin(oldSecondMember, Member.Role.MEMBER);
        memberRepository.save(oldSecondMember);
      }
    } else if (currentSecondResponsible != null && currentMainResponsible != null) {
      team.setResponsible(currentSecondResponsible);
      Member promotedSecondMember = currentSecondResponsible.getMember();
      if (promotedSecondMember != null) {
        assignRoleIfNotAdmin(promotedSecondMember, Member.Role.RESPONSIBLE);
        memberRepository.save(promotedSecondMember);
      }

      Member oldMainMember = currentMainResponsible.getMember();
      if (oldMainMember != null && !oldMainMember.getId().equals(target.getId())) {
        assignRoleIfNotAdmin(oldMainMember, Member.Role.MEMBER);
        memberRepository.save(oldMainMember);
      }
    }

    Responsible newSecondResponsible = target.getResponsible();
    if (newSecondResponsible == null) {
      newSecondResponsible = new Responsible();
      newSecondResponsible.setMember(target);
      target.setResponsible(newSecondResponsible);
      responsibleRepository.save(newSecondResponsible);
    }

    team.setSecondResponsible(newSecondResponsible);

    assignRoleIfNotAdmin(target, Member.Role.RESPONSIBLE);
    memberRepository.save(target);

    return teamRepository.save(team);
  }

  private boolean isMainResponsible(Team team, Long memberId) {
    return team.getResponsible() != null
        && team.getResponsible().getMember() != null
        && memberId.equals(team.getResponsible().getMember().getId());
  }

  private boolean isSecondResponsible(Team team, Long memberId) {
    return team.getSecondResponsible() != null
        && team.getSecondResponsible().getMember() != null
        && memberId.equals(team.getSecondResponsible().getMember().getId());
  }

  private boolean isTeamResponsible(Team team, Long memberId) {
    return isMainResponsible(team, memberId) || isSecondResponsible(team, memberId);
  }

  private void assignRoleIfNotAdmin(Member member, Member.Role role) {
    if (member != null && member.getRole() != Member.Role.ADMIN) {
      member.setRole(role);
    }
  }
}
