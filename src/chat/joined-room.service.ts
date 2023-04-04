import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinedRoom } from './model/joined-room.entity';
import { IJoinedRoom, IRoom } from './model/chat.types';
import { IUser } from './../user/model/user.types';
import { Repository } from 'typeorm';

@Injectable()
export class JoinedRoomService {
  constructor(
    @InjectRepository(JoinedRoom) private readonly joinedRoomRepository: Repository<JoinedRoom>
  ) {}

  async create(joinedRoom: IJoinedRoom) {
    return this.joinedRoomRepository.save(joinedRoom);
  }

  async findByUser(user: IUser) {
    return this.joinedRoomRepository.find({ where: { user } });
  }

  async findByRoom(room: IRoom) {
    return this.joinedRoomRepository
      .createQueryBuilder('joinedRoom')
      .where('joinedRoom.roomId = :roomId', { roomId: room.id.toString() })
      .getMany();
  }

  async deleteBySocketId(socketId: string) {
    return this.joinedRoomRepository.delete({ socketId });
  }

  async deleteAll() {
    await this.joinedRoomRepository.createQueryBuilder().delete().execute();
  }
}
