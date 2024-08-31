import { Column, Entity, Index } from "typeorm";

@Index("django_celery_beat_periodictasks_pkey", ["ident"], { unique: true })
@Entity("django_celery_beat_periodictasks", { schema: "public" })
export class DjangoCeleryBeatPeriodictasks {
  @Column("smallint", { primary: true, name: "ident" })
  ident: number;

  @Column("timestamp with time zone", { name: "last_update" })
  lastUpdate: Date;
}
