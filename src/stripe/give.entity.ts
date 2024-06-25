import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "../user/user.entity";
import { Crowdfunding } from "./crowdfunding.entity";

@Entity()
export class Give {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  datetime: Date;

  @ManyToOne(() => User, user => user.gives)
  user: User;

  @ManyToOne(() => Crowdfunding, crowdfunding => crowdfunding.gives)
  crowdfunding: Crowdfunding;
}
