export type SuccessResponse<T = unknown> = T & {
  message: 'success';
};
