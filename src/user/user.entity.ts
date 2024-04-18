import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Scope } from "../scope/scope.entity";
import { Role } from "../roles/role.entity";
import { JoinTable } from "typeorm";
import { Membership } from "../membership/membership.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  phoneNumber: string;

  @Column()
  numberAndStreet: string;

  @Column()
  postalCode: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column()
  lastConnection: Date;

  @Column()
  isActive: boolean;

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];

  @ManyToMany(() => Scope)
  @JoinTable()
  scopes: Scope[];

  @OneToMany(() => Membership, membership => membership.user)
  memberships: Membership[];
}
