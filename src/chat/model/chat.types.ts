import { User } from 'src/user/model/user.entity';
import { IUser } from './../../user/model/user.types';

export enum ChatEvent {
  ERROR = 'Error',
  MESSAGE = 'message',
  GET_ROOMS = 'rooms',
  CREATE_ROOM = 'createRoom',
  PAGINATE_ROOM = 'paginateRoom',
}

export interface IConnectedUser {
  id?: number;
  socketId: string;
  user: User;
}

export interface IRoom {
  id?: number;
  name?: string;
  description?: string;
  users?: IUser[];
  created_at?: Date;
  updated_at?: Date;
}
