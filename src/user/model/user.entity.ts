import {
  Entity,
  PrimaryGeneratedColumn,
  BeforeInsert,
  Column,
  ManyToMany,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import { Room } from './../../chat/model/room.entity';
import { ConnectedUser } from './../../chat/model/connected-user.entity';
import { JoinedRoom } from './../../chat/model/joined-room.entity';
import { Message } from './../../chat/model/message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @ManyToMany(() => Room, (room) => room.users)
  rooms: Room[];

  @OneToMany(() => ConnectedUser, (connection) => connection.user)
  connections: ConnectedUser[];

  @OneToMany(() => JoinedRoom, (joinedRoom) => joinedRoom.room)
  joinedRooms: JoinedRoom[];

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @BeforeInsert()
  @BeforeUpdate()
  private emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }
}
