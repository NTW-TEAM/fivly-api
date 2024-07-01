import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Assembly } from './assembly.entity';
import { Vote } from './vote.entity';

@Entity()
export class VoteSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column()
  description: string;

  @Column()
  beginDateTime: Date;

  @Column()
  voteTimeInMinutes: number;

  @Column()
  type: string;

  @Column()
  anonymous: boolean;

  @Column()
  canceled: boolean;

  @ManyToOne(() => Assembly, (assembly) => assembly.voteSessions)
  assembly: Assembly;

  @OneToMany(() => Vote, (vote) => vote.voteSession)
  votes: Vote[];
}
