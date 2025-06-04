export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  createdAt: Date;
}

export interface UserInput {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
} 