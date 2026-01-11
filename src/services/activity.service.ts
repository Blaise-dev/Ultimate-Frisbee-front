import api from './api';
import { Activity, ActivityPerformanceData } from '../types';

export const activityService = {
  async getActivitiesBySession(sessionId: string): Promise<Activity[]> {
    const response = await api.get<Activity[]>(`/activities/session/${sessionId}`);
    return response.data;
  },

  async createActivity(data: Partial<Activity>): Promise<Activity> {
    const response = await api.post<Activity>('/activities', data);
    return response.data;
  },

  async updateActivity(id: string, data: Partial<Activity>): Promise<Activity> {
    const response = await api.put<Activity>(`/activities/${id}`, data);
    return response.data;
  },

  async deleteActivity(id: string): Promise<void> {
    await api.delete(`/activities/${id}`);
  },

  async addPerformanceData(data: Partial<ActivityPerformanceData>): Promise<ActivityPerformanceData> {
    const response = await api.post<ActivityPerformanceData>('/activities/performance', data);
    return response.data;
  },

  async getPerformanceDataByAthlete(athleteId: string): Promise<ActivityPerformanceData[]> {
    const response = await api.get<ActivityPerformanceData[]>(`/activities/performance/athlete/${athleteId}`);
    return response.data;
  },
};
