import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";

@Entity()
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  membershipDate: Date;

  @ManyToOne(() => User, user => user.memberships)
  user: User;

}
