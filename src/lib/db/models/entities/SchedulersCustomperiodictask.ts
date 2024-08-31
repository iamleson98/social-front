import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { SchedulersCustomschedule } from "./SchedulersCustomschedule";
import { DjangoCeleryBeatPeriodictask } from "./DjangoCeleryBeatPeriodictask";

@Index("schedulers_customperiodictask_custom_id_2ce85a70", ["customId"], {})
@Index("schedulers_customperiodictask_pkey", ["periodictaskPtrId"], {
  unique: true,
})
@Entity("schedulers_customperiodictask", { schema: "public" })
export class SchedulersCustomperiodictask {
  @Column("integer", { primary: true, name: "periodictask_ptr_id" })
  periodictaskPtrId: number;

  @Column("integer", { name: "custom_id", nullable: true })
  customId: number | null;

  @ManyToOne(
    () => SchedulersCustomschedule,
    (schedulersCustomschedule) =>
      schedulersCustomschedule.schedulersCustomperiodictasks
  )
  @JoinColumn([{ name: "custom_id", referencedColumnName: "id" }])
  custom: SchedulersCustomschedule;

  @OneToOne(
    () => DjangoCeleryBeatPeriodictask,
    (djangoCeleryBeatPeriodictask) =>
      djangoCeleryBeatPeriodictask.schedulersCustomperiodictask
  )
  @JoinColumn([{ name: "periodictask_ptr_id", referencedColumnName: "id" }])
  periodictaskPtr: DjangoCeleryBeatPeriodictask;
}
