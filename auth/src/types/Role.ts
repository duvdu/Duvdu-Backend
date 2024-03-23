import { PERMISSIONS } from '@duvdu-v1/duvdu';




export interface Irole {
  id: string;
  key: string;
  system: boolean;
  permissions: PERMISSIONS[];
}
