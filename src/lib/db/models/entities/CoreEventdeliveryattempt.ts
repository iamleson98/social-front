import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CoreEventdelivery } from "./CoreEventdelivery";

@Index("core_eventdeliveryattempt_delivery_id_278cb539", ["deliveryId"], {})
@Index("core_eventdeliveryattempt_pkey", ["id"], { unique: true })
@Entity("core_eventdeliveryattempt", { schema: "public" })
export class CoreEventdeliveryattempt {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("character varying", { name: "task_id", nullable: true, length: 255 })
  taskId: string | null;

  @Column("double precision", {
    name: "duration",
    nullable: true,
    precision: 53,
  })
  duration: number | null;

  @Column("text", { name: "response", nullable: true })
  response: string | null;

  @Column("text", { name: "response_headers", nullable: true })
  responseHeaders: string | null;

  @Column("text", { name: "request_headers", nullable: true })
  requestHeaders: string | null;

  @Column("character varying", { name: "status", length: 255 })
  status: string;

  @Column("integer", { name: "delivery_id", nullable: true })
  deliveryId: number | null;

  @Column("smallint", { name: "response_status_code", nullable: true })
  responseStatusCode: number | null;

  @ManyToOne(
    () => CoreEventdelivery,
    (coreEventdelivery) => coreEventdelivery.coreEventdeliveryattempts
  )
  @JoinColumn([{ name: "delivery_id", referencedColumnName: "id" }])
  delivery: CoreEventdelivery;
}
