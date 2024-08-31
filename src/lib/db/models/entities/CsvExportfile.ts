import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CsvExportevent } from "./CsvExportevent";
import { AppApp } from "./AppApp";
import { AccountUser } from "./AccountUser";

@Index("csv_exportfile_app_id_bc900999", ["appId"], {})
@Index("csv_exportfile_pkey", ["id"], { unique: true })
@Index("csv_exportfile_user_id_2c9071e6", ["userId"], {})
@Entity("csv_exportfile", { schema: "public" })
export class CsvExportfile {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "status", length: 50 })
  status: string;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("character varying", {
    name: "content_file",
    nullable: true,
    length: 100,
  })
  contentFile: string | null;

  @Column("integer", { name: "app_id", nullable: true })
  appId: number | null;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @Column("character varying", { name: "message", nullable: true, length: 255 })
  message: string | null;

  @OneToMany(
    () => CsvExportevent,
    (csvExportevent) => csvExportevent.exportFile
  )
  csvExportevents: CsvExportevent[];

  @ManyToOne(() => AppApp, (appApp) => appApp.csvExportfiles)
  @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
  app: AppApp;

  @ManyToOne(() => AccountUser, (accountUser) => accountUser.csvExportfiles)
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;
}
