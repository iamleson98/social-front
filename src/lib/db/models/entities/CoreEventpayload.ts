import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CoreEventdelivery } from "./CoreEventdelivery";

@Index("core_eventpayload_pkey", ["id"], { unique: true })
@Entity("core_eventpayload", { schema: "public" })
export class CoreEventpayload {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("text", { name: "payload", default: () => "''" })
  payload: string;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("character varying", {
    name: "payload_file",
    nullable: true,
    length: 100,
  })
  payloadFile: string | null;

  @OneToMany(
    () => CoreEventdelivery,
    (coreEventdelivery) => coreEventdelivery.payload
  )
  coreEventdeliveries: CoreEventdelivery[];
}
