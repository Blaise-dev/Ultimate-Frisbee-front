import api from './api';
import { Session } from '../types';

export const sessionService = {
  async getAllSessions(params?: { type?: string; startDate?: string; endDate?: string }): Promise<Session[]> {
    const response = await api.get<Session[]>('/sessions', { params });
    return response.data;
  },

  async getSessionById(id: string): Promise<Session> {
    const response = await api.get<Session>(`/sessions/${id}`);
    return response.data;
  },

  async createSession(data: Partial<Session> & { athleteIds?: string[] }): Promise<Session> {
    const response = await api.post<Session>('/sessions', data);
    return response.data;
  },

  async updateSession(id: string, data: Partial<Session>): Promise<Session> {
    const response = await api.put<Session>(`/sessions/${id}`, data);
    return response.data;
  },

  async deleteSession(id: string): Promise<void> {
    await api.delete(`/sessions/${id}`);
  },

  async addAthleteToSession(sessionId: string, athleteId: string): Promise<void> {
    await api.post('/sessions/athlete', { sessionId, athleteId });
  },

  async removeAthleteFromSession(sessionId: string, athleteId: string): Promise<void> {
    await api.delete('/sessions/athlete', { data: { sessionId, athleteId } });
  },

  async updateAthleteSessionStatus(
    sessionId: string,
    athleteId: string,
    status: 'registered' | 'present' | 'absent'
  ): Promise<void> {
    await api.put('/sessions/athlete/status', { sessionId, athleteId, status });
  },

  async getSessionAthletes(sessionId: string): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    category: string;
    level: string;
    athleteSession: {
      status: string;
      registeredAt: string;
    };
  }[]> {
    const response = await api.get(`/sessions/${sessionId}/athletes`);
    return response.data;
  },
};
