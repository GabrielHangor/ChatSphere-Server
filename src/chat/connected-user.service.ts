import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectedUser } from './model/connected-user.entity';
import { IConnectedUser } from './model/chat.types';
import { IUser } from './../user/model/user.types';
import { Repository } from 'typeorm';

@Injectable()
export class ConnectedUserService {
  constructor(
    @InjectRepository(ConnectedUser) private readonly connectedUserRepository: Repository<ConnectedUser>
  ) {}

  async saveConnection(connectedUser: IConnectedUser) {
    return this.connectedUserRepository.save(connectedUser);
  }

  async findByUser(user: IUser) {
    return this.connectedUserRepository.find({ where: { user } });
  }

  async deleteBySocketId(socketId: string) {
    return this.connectedUserRepository.delete({ socketId });
  }

  async deleteAll() {
    await this.connectedUserRepository.createQueryBuilder().delete().execute();
  }
}
