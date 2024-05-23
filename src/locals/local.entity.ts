import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Local {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  numberAndStreet: string;

  @Column()
  postalCode: string;

  @Column()
  city: string;

  @Column()
  country: string;

}