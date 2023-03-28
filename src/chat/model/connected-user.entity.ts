import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './../../user/model/user.entity';

@Entity()
export class ConnectedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  socketId: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
