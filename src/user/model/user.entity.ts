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

  @BeforeInsert()
  @BeforeUpdate()
  private emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }
}
