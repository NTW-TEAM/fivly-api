import {
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Activity } from '../activity/activity.entity';

@Entity()
export class ActivityType {
  @PrimaryColumn()
  name: string;

  @OneToMany(() => Activity, (activity) => activity.activityType)
  activities: Activity[];
}
