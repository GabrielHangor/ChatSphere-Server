import { User } from './../../user/model/user.entity';
import { Room } from './room.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class JoinedRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  socketId: string;

  @ManyToOne(() => User, (user) => user.joinedRooms)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Room, (room) => room.joinedUsers)
  @JoinColumn()
  room: Room;
}
