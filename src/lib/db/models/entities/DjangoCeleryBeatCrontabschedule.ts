import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DjangoCeleryBeatPeriodictask } from "./DjangoCeleryBeatPeriodictask";

@Index("django_celery_beat_crontabschedule_pkey", ["id"], { unique: true })
@Entity("django_celery_beat_crontabschedule", { schema: "public" })
export class DjangoCeleryBeatCrontabschedule {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "minute", length: 240 })
  minute: string;

  @Column("character varying", { name: "hour", length: 96 })
  hour: string;

  @Column("character varying", { name: "day_of_week", length: 64 })
  dayOfWeek: string;

  @Column("character varying", { name: "day_of_month", length: 124 })
  dayOfMonth: string;

  @Column("character varying", { name: "month_of_year", length: 64 })
  monthOfYear: string;

  @Column("character varying", { name: "timezone", length: 63 })
  timezone: string;

  @OneToMany(
    () => DjangoCeleryBeatPeriodictask,
    (djangoCeleryBeatPeriodictask) => djangoCeleryBeatPeriodictask.crontab
  )
  djangoCeleryBeatPeriodictasks: DjangoCeleryBeatPeriodictask[];
}
