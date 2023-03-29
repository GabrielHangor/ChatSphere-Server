import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './model/message.entity';
import { IMessage } from './../../dist/src/chat/model/chat.types.d';
import { IRoom } from './model/chat.types';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class MessageService {
  constructor(@InjectRepository(Message) private readonly messageRepository: Repository<Message>) {}

  async create(message: IMessage) {
    return this.messageRepository.save(this.messageRepository.create(message));
  }

  async findByRoom(room: IRoom, options: IPaginationOptions) {
    return paginate(this.messageRepository, options, { where: { room }, relations: ['user', 'room'] });
  }
}
