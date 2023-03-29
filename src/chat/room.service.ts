import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './model/room.entity';
import { Repository } from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { TPage } from 'src/common/model/common.types';
import { IRoom } from './model/chat.types';
import { IUser } from './../user/model/user.types';

@Injectable()
export class RoomService {
  constructor(@InjectRepository(Room) private readonly roomRepository: Repository<Room>) {}

  public async createRoom(room: IRoom, creator: IUser) {
    const newRoom = await this.addCreatorToRoom(room, creator);
    return this.roomRepository.save(newRoom);
  }

  async getRoomsListForUser(userId: number, options: TPage) {
    const query = this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'users')
      .where('users.id = :userId', { userId })
      .leftJoinAndSelect('room.users', 'all_users')
      .orderBy('room.updatedAt', 'DESC');

    const rooms = await paginate(query, options);

    const totalItems = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'users')
      .where('users.id = :userId', { userId })
      .getCount();

    rooms.meta.totalItems = totalItems;

    return rooms;
  }

  private async addCreatorToRoom(room: IRoom, creator: IUser) {
    room.users.push(creator);
    return room;
  }
}
