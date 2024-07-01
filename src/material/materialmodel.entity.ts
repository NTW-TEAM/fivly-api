import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Material } from './material.entity';

@Entity()
export class MaterialModel {
  @PrimaryColumn()
  name: string;

  @Column()
  model: string;

  @Column()
  image: string;

  @OneToMany(() => Material, (material) => material.materialModel)
  materials: Material[];
}
