import { Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ActivityType {

  @PrimaryColumn()
  name: string;
}