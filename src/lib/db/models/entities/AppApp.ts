import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AccountCustomerevent } from "./AccountCustomerevent";
import { AppAppPermissions } from "./AppAppPermissions";
import { AppAppextension } from "./AppAppextension";
import { AppApptoken } from "./AppApptoken";
import { CsvExportevent } from "./CsvExportevent";
import { CsvExportfile } from "./CsvExportfile";
import { DiscountPromotionevent } from "./DiscountPromotionevent";
import { GiftcardGiftcard } from "./GiftcardGiftcard";
import { GiftcardGiftcardevent } from "./GiftcardGiftcardevent";
import { InvoiceInvoiceevent } from "./InvoiceInvoiceevent";
import { OrderOrderevent } from "./OrderOrderevent";
import { OrderOrdergrantedrefund } from "./OrderOrdergrantedrefund";
import { PaymentTransactionevent } from "./PaymentTransactionevent";
import { PaymentTransactionitem } from "./PaymentTransactionitem";
import { ThumbnailThumbnail } from "./ThumbnailThumbnail";
import { WebhookWebhook } from "./WebhookWebhook";

@Index("account_serviceaccount_pkey", ["id"], { unique: true })
@Index("app_meta_idx", ["metadata"], {})
@Index("app_p_meta_idx", ["privateMetadata"], {})
@Index("app_app_uuid_key", ["uuid"], { unique: true })
@Entity("app_app", { schema: "public" })
export class AppApp {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("character varying", { name: "name", length: 60 })
  name: string;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("boolean", { name: "is_active" })
  isActive: boolean;

  @Column("text", { name: "about_app", nullable: true })
  aboutApp: string | null;

  @Column("character varying", { name: "app_url", nullable: true, length: 200 })
  appUrl: string | null;

  @Column("character varying", {
    name: "configuration_url",
    nullable: true,
    length: 200,
  })
  configurationUrl: string | null;

  @Column("text", { name: "data_privacy", nullable: true })
  dataPrivacy: string | null;

  @Column("character varying", {
    name: "data_privacy_url",
    nullable: true,
    length: 200,
  })
  dataPrivacyUrl: string | null;

  @Column("character varying", {
    name: "homepage_url",
    nullable: true,
    length: 200,
  })
  homepageUrl: string | null;

  @Column("character varying", { name: "identifier", length: 256 })
  identifier: string;

  @Column("character varying", {
    name: "support_url",
    nullable: true,
    length: 200,
  })
  supportUrl: string | null;

  @Column("character varying", { name: "type", length: 60 })
  type: string;

  @Column("character varying", { name: "version", nullable: true, length: 60 })
  version: string | null;

  @Column("character varying", {
    name: "manifest_url",
    nullable: true,
    length: 200,
  })
  manifestUrl: string | null;

  @Column("character varying", {
    name: "audience",
    nullable: true,
    length: 256,
  })
  audience: string | null;

  @Column("boolean", { name: "is_installed", default: () => "true" })
  isInstalled: boolean;

  @Column("character varying", { name: "author", nullable: true, length: 60 })
  author: string | null;

  @Column("uuid", { name: "uuid", unique: true })
  uuid: string;

  @Column("character varying", {
    name: "brand_logo_default",
    nullable: true,
    length: 100,
  })
  brandLogoDefault: string | null;

  @Column("timestamp with time zone", { name: "removed_at", nullable: true })
  removedAt: Date | null;

  @OneToMany(
    () => AccountCustomerevent,
    (accountCustomerevent) => accountCustomerevent.app
  )
  accountCustomerevents: AccountCustomerevent[];

  @OneToMany(
    () => AppAppPermissions,
    (appAppPermissions) => appAppPermissions.app
  )
  appAppPermissions: AppAppPermissions[];

  @OneToMany(() => AppAppextension, (appAppextension) => appAppextension.app)
  appAppextensions: AppAppextension[];

  @OneToMany(() => AppApptoken, (appApptoken) => appApptoken.app)
  appApptokens: AppApptoken[];

  @OneToMany(() => CsvExportevent, (csvExportevent) => csvExportevent.app)
  csvExportevents: CsvExportevent[];

  @OneToMany(() => CsvExportfile, (csvExportfile) => csvExportfile.app)
  csvExportfiles: CsvExportfile[];

  @OneToMany(
    () => DiscountPromotionevent,
    (discountPromotionevent) => discountPromotionevent.app
  )
  discountPromotionevents: DiscountPromotionevent[];

  @OneToMany(() => GiftcardGiftcard, (giftcardGiftcard) => giftcardGiftcard.app)
  giftcardGiftcards: GiftcardGiftcard[];

  @OneToMany(
    () => GiftcardGiftcardevent,
    (giftcardGiftcardevent) => giftcardGiftcardevent.app
  )
  giftcardGiftcardevents: GiftcardGiftcardevent[];

  @OneToMany(
    () => InvoiceInvoiceevent,
    (invoiceInvoiceevent) => invoiceInvoiceevent.app
  )
  invoiceInvoiceevents: InvoiceInvoiceevent[];

  @OneToMany(() => OrderOrderevent, (orderOrderevent) => orderOrderevent.app)
  orderOrderevents: OrderOrderevent[];

  @OneToMany(
    () => OrderOrdergrantedrefund,
    (orderOrdergrantedrefund) => orderOrdergrantedrefund.app
  )
  orderOrdergrantedrefunds: OrderOrdergrantedrefund[];

  @OneToMany(
    () => PaymentTransactionevent,
    (paymentTransactionevent) => paymentTransactionevent.app
  )
  paymentTransactionevents: PaymentTransactionevent[];

  @OneToMany(
    () => PaymentTransactionitem,
    (paymentTransactionitem) => paymentTransactionitem.app
  )
  paymentTransactionitems: PaymentTransactionitem[];

  @OneToMany(
    () => ThumbnailThumbnail,
    (thumbnailThumbnail) => thumbnailThumbnail.app
  )
  thumbnailThumbnails: ThumbnailThumbnail[];

  @OneToMany(() => WebhookWebhook, (webhookWebhook) => webhookWebhook.app)
  webhookWebhooks: WebhookWebhook[];
}
