import api from './api';
import { Group } from '../types';

export const groupService = {
  async getAllGroups(): Promise<Group[]> {
    const response = await api.get<Group[]>('/groups');
    return response.data;
  },

  async getGroupById(id: string): Promise<Group & { 
    athletes: Array<{
      id: string;
      firstName: string;
      lastName: string;
      category: string;
      level: string;
      user: {
        email: string;
      };
    }>;
  }> {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  async createGroup(data: {
    name: string;
    category: string;
    level: string;
    coachId: string;
    athleteIds?: string[];
  }): Promise<Group> {
    const response = await api.post<Group>('/groups', data);
    return response.data;
  },

  async updateGroup(id: string, data: Partial<Group>): Promise<Group> {
    const response = await api.put<Group>(`/groups/${id}`, data);
    return response.data;
  },

  async deleteGroup(id: string): Promise<void> {
    await api.delete(`/groups/${id}`);
  },

  async getGroupStats(id: string): Promise<{
    totalAthletes: number;
  }> {
    const response = await api.get(`/groups/${id}/stats`);
    return response.data;
  },
};
