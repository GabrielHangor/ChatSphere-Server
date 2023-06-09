import { IUser } from './../../user/model/user.types';

export enum ChatEvent {
  ERROR = 'Error',
  MESSAGES = 'messages',
  ADD_MESSAGE = 'addMessage',
  GET_ROOMS = 'rooms',
  CREATE_ROOM = 'createRoom',
  PAGINATE_ROOM = 'paginateRoom',
  JOIN_ROOM = 'joinRoom',
  LEAVE_ROOM = 'leaveRoom',
}

export interface IConnectedUser {
  id?: number;
  socketId: string;
  user: IUser;
}

export interface IRoom {
  id?: number;
  name?: string;
  description?: string;
  users?: IUser[];
  created_at?: Date;
  updated_at?: Date;
}

export interface IJoinedRoom {
  id?: number;
  socketId: string;
  user: IUser;
  room: IRoom;
}

export interface IMessage {
  id?: number;
  text: string;
  user: IUser;
  room: IRoom;
  createdAt: Date;
  updatedAt: Date;
}
