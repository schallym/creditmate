export type User = {
  id?: number;
  fullName: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type FilteredUser = Omit<User, 'passwordHash' | 'salt'>;
