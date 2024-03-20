import { PERMISSIONS } from './Permissions';

export enum SystemRoles {
  verified = 'verified',
  unverified = 'unverified',
  admin = 'admin',
}

export interface Irole {
  id: string;
  key: string;
  system: boolean;
  permissions: PERMISSIONS[];
}
