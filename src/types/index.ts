export type UserRole = 'ADMIN' | 'COACH' | 'ATHLETE';

export type AthleteCategory = 'JUNIOR' | 'SENIOR' | 'VETERAN';
export type AthleteLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type GroupType = 'TRAINING' | 'COMPETITION' | 'LEISURE';
export type SessionType = 'TRAINING' | 'MATCH';

export interface Sport {
  id: string;
  name: string;
  description?: string;
  themes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    groups: number;
    sessions: number;
  };
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile?: Athlete | Coach;
}

export interface Athlete {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  category: AthleteCategory;
  level: AthleteLevel;
  profilePicture?: string;
  groups?: AthleteGroup[];
}

export interface Coach {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  description?: string;
  sportId?: string;
  sport?: Sport;
  coach?: {
    id: string;
    firstName: string;
    lastName: string;
    user?: {
      email: string;
      isDeleted: boolean;
    };
  };
}

export interface AthleteGroup {
  athleteId: string;
  groupId: string;
  group: Group;
}

export interface Session {
  id: string;
  title: string;
  type: SessionType;
  coachId: string;
  coach?: Coach;
  sportId?: string;
  sport?: Sport;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  imageUrl?: string;
  isRecurrent: boolean;
  recurrence?: string;
  athletes?: AthleteSession[];
  activities?: Activity[];
}

export interface AthleteSession {
  athleteId: string;
  sessionId: string;
  status: string;
  athlete?: Athlete;
}

export interface Activity {
  id: string;
  sessionId: string;
  name: string;
  theme: string;
  description?: string;
  duration?: number;
  order: number;
  performanceData?: ActivityPerformanceData[];
}

export interface ActivityPerformanceData {
  id: string;
  activityId: string;
  athleteId: string;
  dataType: string;
  value: number;
  unit?: string;
  notes?: string;
  athlete?: Athlete;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  category?: AthleteCategory;
  level?: AthleteLevel;
}

// Match Stats Types
export interface MatchStats {
  session: {
    id: string;
    title: string;
    date: string;
    type: string;
    group?: string;
    sport?: string;
  };
  participants: number;
  activities: number;
  stats: AthleteMatchStats[];
}

export interface AthleteMatchStats {
  athleteId: string;
  name: string;
  category: string;
  level: string;
  rank: number;
  stats: {
    points: number;
    assists: number;
    blocks: number;
    turnovers: number;
    catches: number;
    totalScore: number;
  };
}

export interface AthletePerformanceHistory {
  athlete: {
    id: string;
    name: string;
    category: string;
    level: string;
  };
  summary: {
    totalMatches: number;
    averages: {
      points: number;
      assists: number;
      blocks: number;
      turnovers: number;
      catches: number;
      totalScore: number;
    };
    totals: {
      points: number;
      assists: number;
      blocks: number;
      turnovers: number;
      catches: number;
      totalScore: number;
    };
    bestMatch: {
      sessionId: string;
      title: string;
      date: string;
      group?: string;
      stats: {
        points: number;
        assists: number;
        blocks: number;
        turnovers: number;
        catches: number;
        totalScore: number;
      };
    } | null;
  };
  matchHistory: Array<{
    sessionId: string;
    title: string;
    date: string;
    group?: string;
    stats: {
      points: number;
      assists: number;
      blocks: number;
      turnovers: number;
      catches: number;
      totalScore: number;
    };
  }>;
}
