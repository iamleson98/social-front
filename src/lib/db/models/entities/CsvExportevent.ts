import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AppApp } from "./AppApp";
import { CsvExportfile } from "./CsvExportfile";
import { AccountUser } from "./AccountUser";

@Index("csv_exportevent_app_id_8637fcc5", ["appId"], {})
@Index("csv_exportevent_export_file_id_35f6c448", ["exportFileId"], {})
@Index("csv_exportevent_pkey", ["id"], { unique: true })
@Index("csv_exportevent_user_id_6111f193", ["userId"], {})
@Entity("csv_exportevent", { schema: "public" })
export class CsvExportevent {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp with time zone", { name: "date" })
  date: Date;

  @Column("character varying", { name: "type", length: 255 })
  type: string;

  @Column("jsonb", { name: "parameters" })
  parameters: object;

  @Column("integer", { name: "app_id", nullable: true })
  appId: number | null;

  @Column("integer", { name: "export_file_id" })
  exportFileId: number;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @ManyToOne(() => AppApp, (appApp) => appApp.csvExportevents)
  @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
  app: AppApp;

  @ManyToOne(
    () => CsvExportfile,
    (csvExportfile) => csvExportfile.csvExportevents
  )
  @JoinColumn([{ name: "export_file_id", referencedColumnName: "id" }])
  exportFile: CsvExportfile;

  @ManyToOne(() => AccountUser, (accountUser) => accountUser.csvExportevents)
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;
}
