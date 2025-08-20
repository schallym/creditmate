export type User = {
  id?: number;
  fullName: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FilteredUser = Omit<User, 'passwordHash' | 'salt'>;
