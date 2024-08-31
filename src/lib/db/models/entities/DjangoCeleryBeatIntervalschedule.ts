import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DjangoCeleryBeatPeriodictask } from "./DjangoCeleryBeatPeriodictask";

@Index("django_celery_beat_intervalschedule_pkey", ["id"], { unique: true })
@Entity("django_celery_beat_intervalschedule", { schema: "public" })
export class DjangoCeleryBeatIntervalschedule {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "every" })
  every: number;

  @Column("character varying", { name: "period", length: 24 })
  period: string;

  @OneToMany(
    () => DjangoCeleryBeatPeriodictask,
    (djangoCeleryBeatPeriodictask) => djangoCeleryBeatPeriodictask.interval
  )
  djangoCeleryBeatPeriodictasks: DjangoCeleryBeatPeriodictask[];
}
