import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CoreEventdelivery } from "./CoreEventdelivery";
import { AppApp } from "./AppApp";
import { WebhookWebhookevent } from "./WebhookWebhookevent";

@Index("webhook_webhook_service_account_id_1073b057", ["appId"], {})
@Index("filterable_channel_slugs_idx", ["filterableChannelSlugs"], {})
@Index("webhook_webhook_pkey", ["id"], { unique: true })
@Entity("webhook_webhook", { schema: "public" })
export class WebhookWebhook {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "target_url", length: 255 })
  targetUrl: string;

  @Column("boolean", { name: "is_active" })
  isActive: boolean;

  @Column("character varying", {
    name: "secret_key",
    nullable: true,
    length: 255,
  })
  secretKey: string | null;

  @Column("integer", { name: "app_id" })
  appId: number;

  @Column("character varying", { name: "name", nullable: true, length: 255 })
  name: string | null;

  @Column("text", { name: "subscription_query", nullable: true })
  subscriptionQuery: string | null;

  @Column("jsonb", { name: "custom_headers", nullable: true })
  customHeaders: object | null;

  @Column("varchar", {
    name: "filterable_channel_slugs",
    array: true,
    default: () => "ARRAY[]::character varying[]",
  })
  filterableChannelSlugs: string[];

  @OneToMany(
    () => CoreEventdelivery,
    (coreEventdelivery) => coreEventdelivery.webhook
  )
  coreEventdeliveries: CoreEventdelivery[];

  @ManyToOne(() => AppApp, (appApp) => appApp.webhookWebhooks)
  @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
  app: AppApp;

  @OneToMany(
    () => WebhookWebhookevent,
    (webhookWebhookevent) => webhookWebhookevent.webhook
  )
  webhookWebhookevents: WebhookWebhookevent[];
}
