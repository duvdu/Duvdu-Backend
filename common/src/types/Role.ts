import { PERMISSIONS } from './Permissions';





export interface Irole {
  id: string;
  key: string;
  system: boolean;
  permissions: PERMISSIONS[];
}
