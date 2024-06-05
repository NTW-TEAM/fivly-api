import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";
import { ActivityType } from "../activitytypes/activitytype.entity";
import { Material } from "../material/material.entity";


@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  beginDateTime: Date;

  @Column()
  endDateTime: Date;

  @ManyToOne(() => ActivityType, activityType => activityType.activities)
  activityType: ActivityType;

  @ManyToOne(() => User, user => user.ownedActivities)
  owner: User;

  @ManyToMany(() => User, user => user.participatingActivities)
  @JoinTable()
  participants: User[];

  @ManyToMany(() => Material, material => material.activities)
  @JoinTable()
  materials: Material[];
}