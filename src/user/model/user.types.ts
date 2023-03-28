import { User } from './user.entity';
import { Request } from 'express';

export interface ILoginUserResponse {
  jwt: string;
  id: number;
  email: string;
  username: string;
}

export interface RequestModel extends Request {
  user: User;
}


export interface IUser {
  id?: number;
  username?: string;
  email: string;
  password?: string;
}