import { PERMISSIONS } from './Permissions';

export interface IjwtPayload {
  id: string;
  role: {
    key: string;
    permissions: PERMISSIONS[];
  };
}
