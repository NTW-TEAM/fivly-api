import { Column, Entity, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MaterialModel } from "./materialmodel.entity";
import { Activity } from "../activity/activity.entity";
import { Local } from "../locals/local.entity";

@Entity()
export class Material {

  @PrimaryGeneratedColumn("uuid")
  serialNumber: string;

  @Column()
  @OneToOne(() => MaterialModel)
  materialModel: MaterialModel;

  @ManyToMany(() => Activity, activity => activity.materials)
  activities: Activity[];

  @ManyToOne(() => Local, local => local.materials)
  local: Local;
}
