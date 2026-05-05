export type User = {
  id?: number;
  fullName: string;
  email: string;
  passwordHash?: string | null;
  salt?: string | null;
  authProvider?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  passwordResetToken?: string | null;
};

export type FilteredUser = Omit<User, 'passwordHash' | 'salt' | 'passwordResetToken'>;
