interface Chat {
  sourceUser: ObjectId;
  targetUser: ObjectId;
  isNoticed: boolean;
  isWatched: boolean;
  attachment: string;
  message: string;
}
