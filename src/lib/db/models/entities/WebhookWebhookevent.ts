import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { WebhookWebhook } from "./WebhookWebhook";

@Index("webhook_webhookevent_event_type_cd6b8c13_like", ["eventType"], {})
@Index("webhook_webhookevent_event_type_cd6b8c13", ["eventType"], {})
@Index("webhook_webhookevent_pkey", ["id"], { unique: true })
@Index("webhook_webhookevent_webhook_id_73b5c9e1", ["webhookId"], {})
@Entity("webhook_webhookevent", { schema: "public" })
export class WebhookWebhookevent {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "event_type", length: 128 })
  eventType: string;

  @Column("integer", { name: "webhook_id" })
  webhookId: number;

  @ManyToOne(
    () => WebhookWebhook,
    (webhookWebhook) => webhookWebhook.webhookWebhookevents
  )
  @JoinColumn([{ name: "webhook_id", referencedColumnName: "id" }])
  webhook: WebhookWebhook;
}
