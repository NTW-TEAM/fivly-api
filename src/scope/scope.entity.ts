import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user/user.entity';
import { JoinTable } from 'typeorm';
import { Role } from '../roles/role.entity';

@Entity()
export class Scope {
  @PrimaryColumn()
  name: string;
  @Column()
  description: string;
  @ManyToMany(() => User)
  users: User[];
  @ManyToMany(() => Role)
  roles: Role[];
}
