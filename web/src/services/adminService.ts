import { api } from '../api/client';
import { User } from '../types';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalAdmins: number;
  totalProfessionals: number;
}

export interface AdminUserFilters {
  search?: string;
  role?: string;
  status?: 'all' | 'active' | 'banned' | string;
}

export interface AdminUpdateUserData {
  name?: string;
  email?: string;
  role?: 'USER' | 'ADMIN' | 'PROFESSIONAL';
  isEmailVerified?: boolean;
  weight?: number | null;
  height?: number | null;
  age?: number | null;
  gender?: string | null;
  activityLevel?: string | null;
  goal?: string | null;
  bodyFatPct?: number | null;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const { data } = await api.get<AdminStats>('/admin/stats');
    return data;
  },

  async listUsers(filters?: AdminUserFilters): Promise<User[]> {
    const { data } = await api.get<User[]>('/admin/users', { params: filters });
    return data;
  },

  async getUserById(id: string): Promise<User> {
    const { data } = await api.get<User>(`/admin/users/${id}`);
    return data;
  },

  async updateUser(id: string, updateData: AdminUpdateUserData): Promise<User> {
    const { data } = await api.patch<User>(`/admin/users/${id}`, updateData);
    return data;
  },

  async banUser(id: string, isBanned: boolean, reason?: string): Promise<User> {
    const { data } = await api.post<User>(`/admin/users/${id}/ban`, { isBanned, reason });
    return data;
  },

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete<{ success: boolean; message: string }>(`/admin/users/${id}`);
    return data;
  },

  async claimInitialAdmin(): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post<{ success: boolean; message: string }>('/admin/claim-initial-admin');
    return data;
  },
};
