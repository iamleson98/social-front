import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DjangoCeleryBeatPeriodictask } from "./DjangoCeleryBeatPeriodictask";

@Index("django_celery_beat_clockedschedule_pkey", ["id"], { unique: true })
@Entity("django_celery_beat_clockedschedule", { schema: "public" })
export class DjangoCeleryBeatClockedschedule {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp with time zone", { name: "clocked_time" })
  clockedTime: Date;

  @OneToMany(
    () => DjangoCeleryBeatPeriodictask,
    (djangoCeleryBeatPeriodictask) => djangoCeleryBeatPeriodictask.clocked
  )
  djangoCeleryBeatPeriodictasks: DjangoCeleryBeatPeriodictask[];
}
