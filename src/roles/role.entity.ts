import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";
import { Scope } from "../scope/scope.entity";
import { Permission } from "../ged/permission.entity";

@Entity()
export class Role {
  @PrimaryColumn()
  name: string;
  @Column()
  description: string;
  @ManyToMany(() => User)
  users: User[];
  @ManyToMany(() => Scope)
  @JoinTable()
  scopes: Scope[];
  @OneToMany(() => Permission, permission => permission.role)
  filePermissions: Permission[];
}
