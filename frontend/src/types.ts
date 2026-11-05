// Specialty enum matching backend
type Specialty =
  | 'ARCHITECT'
  | 'EXECUTOR'
  | 'TACTICIAN'
  | 'GUARDIAN'
  | 'CATALYST'
  | 'DISRUPTOR'
  | 'HEALER';

const SPECIALTIES: Specialty[] = [
  'ARCHITECT',
  'EXECUTOR',
  'TACTICIAN',
  'GUARDIAN',
  'CATALYST',
  'DISRUPTOR',
  'HEALER',
];

const SPECIALTY_LABELS: Record<Specialty, string> = {
  ARCHITECT: '🏗️ Architecte',
  EXECUTOR: '⚡ Exécuteur',
  TACTICIAN: '🧠 Tacticien',
  GUARDIAN: '🛡️ Gardien',
  CATALYST: '🔥 Catalyseur',
  DISRUPTOR: '💥 Perturbateur',
  HEALER: '💚 Guérisseur',
};

// Role type for members
type MemberRole = 'MEMBER' | 'RESPONSIBLE' | 'ADMIN';

// Credentials for login
interface Credentials {
  email: string;
  password: string;
}

// Registration request
interface RegisterRequest {
  email: string;
  tag: string;
  password: string;
  specialty: Specialty;
  profileImage?: string;
}

// Authenticated member from API
interface AuthenticatedMember {
  id?: number;
  email: string;
  tag: string;
  specialty: Specialty;
  token: string;
  createdAt?: string;
  isAdmin?: boolean;
  isResponsible?: boolean;
  role: MemberRole;
  profileImage?: string;
  teamId: number | null;
}

type MaybeAuthenticatedMember = AuthenticatedMember | undefined;

// Team interfaces
interface Team {
  id: number;
  nom: string;
  responsible: AuthenticatedMember;
  secondResponsible?: AuthenticatedMember;
}

interface CreateTeamRequest {
  nom: string;
  secondResponsibleId?: number;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface UpdateSpecialtyRequest {
  specialty: Specialty;
}

interface UpdateProfileImageRequest {
  profileImage: string;
}

interface MemberUnavailability {
  id: number;
  startDate: string;
  endDate: string;
}

interface AdminRoleUpdateResponse {
  message: string;
  role: MemberRole;
}

interface AdminSummary {
  id: number;
  tag: string;
  email: string;
}

interface MemberContextType {
  authenticatedMember: MaybeAuthenticatedMember;
  registerMember: (request: RegisterRequest) => Promise<void>;
  loginMember: (
    credentials: Credentials,
    rememberMe?: boolean,
  ) => Promise<void>;
  changePassword: (request: ChangePasswordRequest) => Promise<void>;
  updateSpecialty: (request: UpdateSpecialtyRequest) => Promise<void>;
  updateProfileImage: (request: UpdateProfileImageRequest) => Promise<void>;
  clearMember: () => void;
  updateMemberRole: (newRole: MemberRole) => void;
  updateTeamId: (teamId: number | null) => void;
  getMyUnavailabilities: () => Promise<MemberUnavailability[]>;
  createUnavailability: (
    startDate: string,
    endDate: string,
  ) => Promise<MemberUnavailability>;
  deleteUnavailability: (id: number) => Promise<void>;
  promoteMemberToAdmin: (
    targetEmail: string,
  ) => Promise<AdminRoleUpdateResponse>;
  removeMemberAdminRole: (
    targetEmail: string,
  ) => Promise<AdminRoleUpdateResponse>;
  getAdmins: () => Promise<AdminSummary[]>;
  searchMembers: (query: string) => Promise<AdminSummary[]>;
}

interface TeamResponsibleSummary {
  id: number;
  tag: string;
}

interface TeamSummary {
  id: number;
  nom: string;
  responsible?: TeamResponsibleSummary | null;
  secondResponsible?: TeamResponsibleSummary | null;
  registeredTournamentNames?: string[];
}

interface Memberdto {
  id: number;
  tag: string;
  specialty: Specialty;
  role: MemberRole;
}

// JoinRequest - flexible to match backend entity serialization
interface JoinRequest {
  id: number;
  member?: {
    id?: number;
    tag?: string;
    email?: string;
    specialty?: Specialty;
  } | null;
  // Alternative: backend might return memberId directly
  memberId?: number;
  memberTag?: string;
  memberSpecialty?: Specialty;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  sentAt: string;
  senderId: number;
  senderTag: string;
  redirectLink: string | null;
  notificationTypeId: number;
  notificationTypeName: string;
}

interface PublicMemberTournament {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'PREPARATION' | 'INSCRIPTION' | 'EN_COURS' | 'TERMINE';
}

interface PublicMemberProfile {
  id: number;
  tag: string;
  specialty: Specialty;
  profileImage?: string;
  teamName?: string;
  tournaments?: PublicMemberTournament[];
  createdAt?: string;
  role: string;
}

export type {
  Specialty,
  MemberRole,
  Credentials,
  RegisterRequest,
  AuthenticatedMember,
  MaybeAuthenticatedMember,
  MemberContextType,
  ChangePasswordRequest,
  UpdateSpecialtyRequest,
  UpdateProfileImageRequest,
  Team,
  CreateTeamRequest,
  TeamSummary,
  TeamResponsibleSummary,
  Memberdto,
  JoinRequest,
  Notification,
  PublicMemberTournament,
  PublicMemberProfile,
  MemberUnavailability,
  AdminRoleUpdateResponse,
  AdminSummary,
};

export { SPECIALTIES, SPECIALTY_LABELS };
