export type UserRole = 'ADMIN' | 'COACH' | 'ATHLETE';

export type AthleteCategory = 'JUNIOR' | 'SENIOR' | 'VETERAN';
export type AthleteLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type GroupType = 'TRAINING' | 'COMPETITION' | 'LEISURE';
export type SessionType = 'TRAINING' | 'MATCH';
export type ActivityTheme =
  | 'COMPETITION'
  | 'STRENGTH_TRAINING'
  | 'POSITIONING'
  | 'THROWING'
  | 'CATCHING'
  | 'STRATEGY'
  | 'ENDURANCE'
  | 'TECHNIQUE'
  | 'WARM_UP'
  | 'COOL_DOWN';

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
  groups?: AthleteGroup[];
}

export interface Coach {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
}

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  description?: string;
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
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
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
  theme: ActivityTheme;
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
