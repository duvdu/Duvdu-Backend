import { PERMISSIONS } from './Permissions';

export interface IjwtPayload {
  id: string;
  isVerified: boolean;
  isBlocked: { value: boolean; reason?: string };
  role: {
    key: string;
    permissions: PERMISSIONS[];
  };
}
