import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Scope } from "../scope/scope.entity";
import { Role } from "../roles/role.entity";
import { JoinTable } from "typeorm";
import { Membership } from "../membership/membership.entity";
import { Activity } from "../activity/activity.entity";
import { Assembly } from "../assembly/assembly.entity";
import { Permission } from "../ged/permission.entity";
import { Crowdfunding } from "../stripe/crowdfunding.entity";
import { Give } from "../stripe/give.entity";
import { Donation } from "../stripe/donation.entity";

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

  @OneToMany(() => Activity, activity => activity.owner)
  ownedActivities: Activity[];

  @ManyToMany(() => Activity, activity => activity.participants)
  participatingActivities: Activity[];

  @ManyToMany(() => Assembly, assembly => assembly.participants)
  @JoinTable()
  participatingAssemblies: Assembly[];

  @OneToMany(() => Permission, permission => permission.user)
  filePermissions: Permission[];
  
  @OneToMany(() => Crowdfunding, crowdfunding => crowdfunding.creator)
  crowdfundings: Crowdfunding[];

  @OneToMany(() => Give, give => give.user)
  gives: Give[];

  @OneToMany(()=>Donation, donation => donation.potentialUser)
  donations: Donation[];

}
