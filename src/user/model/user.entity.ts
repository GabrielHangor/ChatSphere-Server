import { Entity, PrimaryGeneratedColumn, BeforeInsert, Column, ManyToMany } from 'typeorm';
import { Room } from './../../chat/model/room.entity';

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

  @ManyToMany(() => Room, room => room.users)
  rooms: Room[];

  @BeforeInsert()
  private emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }
}
