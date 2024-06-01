import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { VoteSession } from './votesession.entity';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  for: boolean;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => VoteSession, voteSession => voteSession.votes)
  voteSession: VoteSession;
}
