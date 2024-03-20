import { PERMISSIONS } from './Permissions';

export interface IjwtPayload {
  id: string;
  isVerified: boolean;
  isBlocked: boolean;
  role: {
    key: string;
    permissions: PERMISSIONS[];
  };
}
