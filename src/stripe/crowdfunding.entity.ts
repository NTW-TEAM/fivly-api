import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Give } from './give.entity';

@Entity()
export class Crowdfunding {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  goalAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  actualAmount: number;

  @Column()
  beginDatetime: Date;

  @Column()
  endDatetime: Date;

  @ManyToOne(() => User, (user) => user.crowdfundings)
  creator: User;

  @OneToMany(() => Give, (give) => give.crowdfunding)
  gives: Give[];
}
