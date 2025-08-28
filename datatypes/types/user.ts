import type { BaseEntity, WithId, WithTimestamps } from './base';

export type UserRole = 'admin' | 'user';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface UserData {
  email: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  avatar_url: string | null;
  phone: string | null;
  department: string | null;
}

export interface UserProfileData {
  created_at: string;
  userid: string;
  name: string;
  phone: string | null;
  unit: string | null;
  segment: string | null;
  division: string | null;
  legal_entity: string | null;
  isActive: boolean;
  role: string | null;
}

export type User = Complete<UserData>;
export type NewUser = UserData;
export type UpdateUser = Partial<UserData>;
export type UserProfile = UserProfileData;
export type NewUserProfile = UserProfileData;
export type UpdateUserProfile = Partial<UserProfileData>;

export type UserWithTimestamps = WithTimestamps<UserData>;
export type UserWithId = WithId<UserData>;
export type Complete<T> = T & BaseEntity;
