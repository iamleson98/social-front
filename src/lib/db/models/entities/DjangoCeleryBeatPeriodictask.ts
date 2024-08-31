import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DjangoCeleryBeatClockedschedule } from "./DjangoCeleryBeatClockedschedule";
import { DjangoCeleryBeatCrontabschedule } from "./DjangoCeleryBeatCrontabschedule";
import { DjangoCeleryBeatIntervalschedule } from "./DjangoCeleryBeatIntervalschedule";
import { DjangoCeleryBeatSolarschedule } from "./DjangoCeleryBeatSolarschedule";
import { SchedulersCustomperiodictask } from "./SchedulersCustomperiodictask";

@Index("django_celery_beat_periodictask_clocked_id_47a69f82", ["clockedId"], {})
@Index("django_celery_beat_periodictask_crontab_id_d3cba168", ["crontabId"], {})
@Index("django_celery_beat_periodictask_pkey", ["id"], { unique: true })
@Index(
  "django_celery_beat_periodictask_interval_id_a8ca27da",
  ["intervalId"],
  {}
)
@Index("django_celery_beat_periodictask_name_key", ["name"], { unique: true })
@Index("django_celery_beat_periodictask_name_265a36b7_like", ["name"], {})
@Index("django_celery_beat_periodictask_solar_id_a87ce72c", ["solarId"], {})
@Entity("django_celery_beat_periodictask", { schema: "public" })
export class DjangoCeleryBeatPeriodictask {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", unique: true, length: 200 })
  name: string;

  @Column("character varying", { name: "task", length: 200 })
  task: string;

  @Column("text", { name: "args" })
  args: string;

  @Column("text", { name: "kwargs" })
  kwargs: string;

  @Column("character varying", { name: "queue", nullable: true, length: 200 })
  queue: string | null;

  @Column("character varying", {
    name: "exchange",
    nullable: true,
    length: 200,
  })
  exchange: string | null;

  @Column("character varying", {
    name: "routing_key",
    nullable: true,
    length: 200,
  })
  routingKey: string | null;

  @Column("timestamp with time zone", { name: "expires", nullable: true })
  expires: Date | null;

  @Column("boolean", { name: "enabled" })
  enabled: boolean;

  @Column("timestamp with time zone", { name: "last_run_at", nullable: true })
  lastRunAt: Date | null;

  @Column("integer", { name: "total_run_count" })
  totalRunCount: number;

  @Column("timestamp with time zone", { name: "date_changed" })
  dateChanged: Date;

  @Column("text", { name: "description" })
  description: string;

  @Column("integer", { name: "crontab_id", nullable: true })
  crontabId: number | null;

  @Column("integer", { name: "interval_id", nullable: true })
  intervalId: number | null;

  @Column("integer", { name: "solar_id", nullable: true })
  solarId: number | null;

  @Column("boolean", { name: "one_off" })
  oneOff: boolean;

  @Column("timestamp with time zone", { name: "start_time", nullable: true })
  startTime: Date | null;

  @Column("integer", { name: "priority", nullable: true })
  priority: number | null;

  @Column("text", { name: "headers" })
  headers: string;

  @Column("integer", { name: "clocked_id", nullable: true })
  clockedId: number | null;

  @Column("integer", { name: "expire_seconds", nullable: true })
  expireSeconds: number | null;

  @ManyToOne(
    () => DjangoCeleryBeatClockedschedule,
    (djangoCeleryBeatClockedschedule) =>
      djangoCeleryBeatClockedschedule.djangoCeleryBeatPeriodictasks
  )
  @JoinColumn([{ name: "clocked_id", referencedColumnName: "id" }])
  clocked: DjangoCeleryBeatClockedschedule;

  @ManyToOne(
    () => DjangoCeleryBeatCrontabschedule,
    (djangoCeleryBeatCrontabschedule) =>
      djangoCeleryBeatCrontabschedule.djangoCeleryBeatPeriodictasks
  )
  @JoinColumn([{ name: "crontab_id", referencedColumnName: "id" }])
  crontab: DjangoCeleryBeatCrontabschedule;

  @ManyToOne(
    () => DjangoCeleryBeatIntervalschedule,
    (djangoCeleryBeatIntervalschedule) =>
      djangoCeleryBeatIntervalschedule.djangoCeleryBeatPeriodictasks
  )
  @JoinColumn([{ name: "interval_id", referencedColumnName: "id" }])
  interval: DjangoCeleryBeatIntervalschedule;

  @ManyToOne(
    () => DjangoCeleryBeatSolarschedule,
    (djangoCeleryBeatSolarschedule) =>
      djangoCeleryBeatSolarschedule.djangoCeleryBeatPeriodictasks
  )
  @JoinColumn([{ name: "solar_id", referencedColumnName: "id" }])
  solar: DjangoCeleryBeatSolarschedule;

  @OneToOne(
    () => SchedulersCustomperiodictask,
    (schedulersCustomperiodictask) =>
      schedulersCustomperiodictask.periodictaskPtr
  )
  schedulersCustomperiodictask: SchedulersCustomperiodictask;
}
