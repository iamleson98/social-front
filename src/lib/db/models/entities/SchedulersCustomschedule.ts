import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SchedulersCustomperiodictask } from "./SchedulersCustomperiodictask";

@Index("schedulers_customschedule_pkey", ["id"], { unique: true })
@Index(
  "schedulers_customschedule_schedule_import_path_key",
  ["scheduleImportPath"],
  { unique: true }
)
@Index(
  "schedulers_customschedule_schedule_import_path_d6057fed_like",
  ["scheduleImportPath"],
  {}
)
@Entity("schedulers_customschedule", { schema: "public" })
export class SchedulersCustomschedule {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "schedule_import_path",
    unique: true,
    length: 255,
  })
  scheduleImportPath: string;

  @OneToMany(
    () => SchedulersCustomperiodictask,
    (schedulersCustomperiodictask) => schedulersCustomperiodictask.custom
  )
  schedulersCustomperiodictasks: SchedulersCustomperiodictask[];
}
