import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { VoteSession } from './votesession.entity';

@Entity()
export class Assembly {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  isGeneral: boolean;

  @Column()
  hasStarted: boolean;

  @Column()
  datetime: Date;

  @Column()
  description: string;

  @Column()
  quorum: number;

  @Column()
  location: string;

  @ManyToMany(() => User, (user) => user.participatingAssemblies)
  participants: User[];

  @OneToMany(() => VoteSession, (voteSession) => voteSession.assembly)
  voteSessions: VoteSession[];
}
