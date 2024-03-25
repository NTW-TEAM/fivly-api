import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
