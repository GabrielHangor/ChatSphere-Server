import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './model/room.entity';
import { Repository } from 'typeorm';
import { User } from './../user/model/user.entity';
import {  paginate } from 'nestjs-typeorm-paginate';
import { TPage } from 'src/common/model/common.types';

@Injectable()
export class RoomService {
  constructor(@InjectRepository(Room) private readonly roomRepository: Repository<Room>) {}

  public async createRoom(room: Room, creator: User) {
    const newRoom = await this.addCreatorToRoom(room, creator);
    return this.roomRepository.save(newRoom);
  }

  public async getRoomsListForUser(userId: number, options: TPage) {
    const query = this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'user')
      .where('user.id = :userId', { userId })
      .leftJoinAndSelect('room.users', 'allUsers')
      .orderBy('room.updatedAt', 'DESC');

    return paginate(query, options);
  }

  private async addCreatorToRoom(room: Room, creator: User) {
    room.users.push(creator);
    return room;
  }
}
