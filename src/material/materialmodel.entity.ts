import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MaterialModel {

  @PrimaryColumn()
  name: string;

  @Column()
  model: string;

  @Column()
  image: string;

}