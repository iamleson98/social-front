import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CoreEventpayload } from "./CoreEventpayload";
import { WebhookWebhook } from "./WebhookWebhook";
import { CoreEventdeliveryattempt } from "./CoreEventdeliveryattempt";

@Index("core_eventdelivery_pkey", ["id"], { unique: true })
@Index("core_eventdelivery_payload_id_34de9fbd", ["payloadId"], {})
@Index("core_eventdelivery_webhook_id_1ff668bb", ["webhookId"], {})
@Entity("core_eventdelivery", { schema: "public" })
export class CoreEventdelivery {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("character varying", { name: "status", length: 255 })
  status: string;

  @Column("character varying", { name: "event_type", length: 255 })
  eventType: string;

  @Column("integer", { name: "payload_id", nullable: true })
  payloadId: number | null;

  @Column("integer", { name: "webhook_id" })
  webhookId: number;

  @ManyToOne(
    () => CoreEventpayload,
    (coreEventpayload) => coreEventpayload.coreEventdeliveries
  )
  @JoinColumn([{ name: "payload_id", referencedColumnName: "id" }])
  payload: CoreEventpayload;

  @ManyToOne(
    () => WebhookWebhook,
    (webhookWebhook) => webhookWebhook.coreEventdeliveries
  )
  @JoinColumn([{ name: "webhook_id", referencedColumnName: "id" }])
  webhook: WebhookWebhook;

  @OneToMany(
    () => CoreEventdeliveryattempt,
    (coreEventdeliveryattempt) => coreEventdeliveryattempt.delivery
  )
  coreEventdeliveryattempts: CoreEventdeliveryattempt[];
}
