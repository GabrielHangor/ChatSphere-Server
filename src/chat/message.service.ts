import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './model/message.entity';
import { IMessage, IRoom } from './model/chat.types';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class MessageService {
  constructor(@InjectRepository(Message) private readonly messageRepository: Repository<Message>) {}

  async create(message: IMessage) {
    return this.messageRepository.save(this.messageRepository.create(message));
  }

  async findByRoom(room: IRoom, options: IPaginationOptions) {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.room', 'room')
      .where('room.id = :roomId', { roomId: room.id })
      .leftJoinAndSelect('message.user', 'user')
      .orderBy('message.createdAt', 'ASC');

    return paginate(query, options);
  }
}
