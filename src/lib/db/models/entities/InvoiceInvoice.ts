import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrderOrder } from "./OrderOrder";
import { InvoiceInvoiceevent } from "./InvoiceInvoiceevent";

@Index("invoice_invoice_pkey", ["id"], { unique: true })
@Index("invoice_meta_idx", ["metadata"], {})
@Index("invoice_invoice_order_token_id_d2755b86", ["orderId"], {})
@Index("invoice_p_meta_idx", ["privateMetadata"], {})
@Entity("invoice_invoice", { schema: "public" })
export class InvoiceInvoice {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("character varying", { name: "status", length: 50 })
  status: string;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp with time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("character varying", { name: "number", nullable: true, length: 255 })
  number: string | null;

  @Column("timestamp with time zone", { name: "created", nullable: true })
  created: Date | null;

  @Column("character varying", {
    name: "external_url",
    nullable: true,
    length: 2048,
  })
  externalUrl: string | null;

  @Column("character varying", { name: "invoice_file", length: 100 })
  invoiceFile: string;

  @Column("character varying", { name: "message", nullable: true, length: 255 })
  message: string | null;

  @Column("uuid", { name: "order_id", nullable: true })
  orderId: string | null;

  @ManyToOne(() => OrderOrder, (orderOrder) => orderOrder.invoiceInvoices)
  @JoinColumn([{ name: "order_id", referencedColumnName: "id" }])
  order: OrderOrder;

  @OneToMany(
    () => InvoiceInvoiceevent,
    (invoiceInvoiceevent) => invoiceInvoiceevent.invoice
  )
  invoiceInvoiceevents: InvoiceInvoiceevent[];
}
