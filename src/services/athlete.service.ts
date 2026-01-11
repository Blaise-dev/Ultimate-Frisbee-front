import api from './api';
import { Athlete } from '../types';

export const athleteService = {
  async getAllAthletes(): Promise<Athlete[]> {
    const response = await api.get<Athlete[]>('/athletes');
    return response.data;
  },

  async getAthleteById(id: string): Promise<Athlete> {
    const response = await api.get<Athlete>(`/athletes/${id}`);
    return response.data;
  },

  async createAthlete(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    category: string;
    level: string;
  }): Promise<Athlete> {
    const response = await api.post<{ athlete: Athlete }>('/athletes', data);
    return response.data.athlete;
  },

  async updateAthlete(id: string, data: Partial<Athlete>): Promise<Athlete> {
    const response = await api.put<Athlete>(`/athletes/${id}`, data);
    return response.data;
  },

  async deleteAthlete(id: string): Promise<void> {
    await api.delete(`/athletes/${id}`);
  },

  async getAthleteStats(id: string): Promise<{
    totalSessions: number;
    totalGroups: number;
    totalPerformances: number;
  }> {
    const response = await api.get(`/athletes/${id}/stats`);
    return response.data;
  },

  async addAthleteToGroup(athleteId: string, groupId: string): Promise<void> {
    await api.post('/athletes/group', { athleteId, groupId });
  },

  async removeAthleteFromGroup(athleteId: string, groupId: string): Promise<void> {
    await api.delete(`/athletes/${athleteId}/group/${groupId}`);
  },
};
