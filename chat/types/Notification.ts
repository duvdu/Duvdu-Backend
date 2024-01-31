export interface Inotification {
  sourceUserId: string;
  targetUserId: string;
  action: 'follow' | 'saved';
}
