export type UpdateProfileDto = {
  fullName?: string;
  email?: string;
};

export type UpdatePasswordDto = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
