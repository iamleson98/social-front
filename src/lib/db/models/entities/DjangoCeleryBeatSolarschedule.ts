import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DjangoCeleryBeatPeriodictask } from "./DjangoCeleryBeatPeriodictask";

@Index(
  "django_celery_beat_solar_event_latitude_longitude_ba64999a_uniq",
  ["event", "latitude", "longitude"],
  { unique: true }
)
@Index("django_celery_beat_solarschedule_pkey", ["id"], { unique: true })
@Entity("django_celery_beat_solarschedule", { schema: "public" })
export class DjangoCeleryBeatSolarschedule {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "event", unique: true, length: 24 })
  event: string;

  @Column("numeric", { name: "latitude", unique: true, precision: 9, scale: 6 })
  latitude: string;

  @Column("numeric", {
    name: "longitude",
    unique: true,
    precision: 9,
    scale: 6,
  })
  longitude: string;

  @OneToMany(
    () => DjangoCeleryBeatPeriodictask,
    (djangoCeleryBeatPeriodictask) => djangoCeleryBeatPeriodictask.solar
  )
  djangoCeleryBeatPeriodictasks: DjangoCeleryBeatPeriodictask[];
}
