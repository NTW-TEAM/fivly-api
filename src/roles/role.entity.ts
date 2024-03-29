import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";
import { Scope } from "../scope/scope.entity";

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true})
  name: string;
  @Column()
  description: string;
  @ManyToMany(() => User)
  users: User[];
  @ManyToMany(() => Scope)
  @JoinTable()
  scopes: Scope[];
}
