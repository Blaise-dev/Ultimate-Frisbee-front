import api from './api';
import { Coach } from '../types';

export const coachService = {
  async getAllCoaches(): Promise<Coach[]> {
    const response = await api.get<Coach[]>('/coaches');
    return response.data;
  },

  async getCoachById(id: string): Promise<Coach> {
    const response = await api.get<Coach>(`/coaches/${id}`);
    return response.data;
  },

  async createCoach(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    specialization: string;
    experienceYears: number;
  }): Promise<Coach> {
    const response = await api.post<{ coach: Coach }>('/coaches', data);
    return response.data.coach;
  },

  async updateCoach(id: string, data: Partial<Coach>): Promise<Coach> {
    const response = await api.put<Coach>(`/coaches/${id}`, data);
    return response.data;
  },

  async deleteCoach(id: string): Promise<void> {
    await api.delete(`/coaches/${id}`);
  },

  async getCoachStats(id: string): Promise<{
    totalSessions: number;
    upcomingSessions: number;
    pastSessions: number;
  }> {
    const response = await api.get(`/coaches/${id}/stats`);
    return response.data;
  },
};
