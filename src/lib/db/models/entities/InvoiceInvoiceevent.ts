import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AppApp } from "./AppApp";
import { InvoiceInvoice } from "./InvoiceInvoice";
import { AccountUser } from "./AccountUser";
import { OrderOrder } from "./OrderOrder";

@Index("invoice_invoiceevent_app_id_eb92fa41", ["appId"], {})
@Index("invoice_invoiceevent_pkey", ["id"], { unique: true })
@Index("invoice_invoiceevent_invoice_id_de0632ca", ["invoiceId"], {})
@Index("invoice_invoiceevent_order_token_id_acbb2c92", ["orderId"], {})
@Index("invoice_invoiceevent_user_id_cd599b8d", ["userId"], {})
@Entity("invoice_invoiceevent", { schema: "public" })
export class InvoiceInvoiceevent {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp with time zone", { name: "date" })
  date: Date;

  @Column("character varying", { name: "type", length: 255 })
  type: string;

  @Column("jsonb", { name: "parameters" })
  parameters: object;

  @Column("integer", { name: "invoice_id", nullable: true })
  invoiceId: number | null;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @Column("integer", { name: "app_id", nullable: true })
  appId: number | null;

  @Column("uuid", { name: "order_id", nullable: true })
  orderId: string | null;

  @ManyToOne(() => AppApp, (appApp) => appApp.invoiceInvoiceevents)
  @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
  app: AppApp;

  @ManyToOne(
    () => InvoiceInvoice,
    (invoiceInvoice) => invoiceInvoice.invoiceInvoiceevents
  )
  @JoinColumn([{ name: "invoice_id", referencedColumnName: "id" }])
  invoice: InvoiceInvoice;

  @ManyToOne(
    () => AccountUser,
    (accountUser) => accountUser.invoiceInvoiceevents
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: AccountUser;

  @ManyToOne(() => OrderOrder, (orderOrder) => orderOrder.invoiceInvoiceevents)
  @JoinColumn([{ name: "order_id", referencedColumnName: "id" }])
  order: OrderOrder;
}
