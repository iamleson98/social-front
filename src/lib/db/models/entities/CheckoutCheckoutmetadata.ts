import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CheckoutCheckout } from "./CheckoutCheckout";

@Index("checkout_checkoutmetadata_checkout_id_key", ["checkoutId"], {
  unique: true,
})
@Index("checkout_checkoutmetadata_pkey", ["id"], { unique: true })
@Index("checkoutmetadata_meta_idx", ["metadata"], {})
@Index("checkoutmetadata_p_meta_idx", ["privateMetadata"], {})
@Entity("checkout_checkoutmetadata", { schema: "public" })
export class CheckoutCheckoutmetadata {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("uuid", { name: "checkout_id", unique: true })
  checkoutId: string;

  @OneToOne(
    () => CheckoutCheckout,
    (checkoutCheckout) => checkoutCheckout.checkoutCheckoutmetadata
  )
  @JoinColumn([{ name: "checkout_id", referencedColumnName: "token" }])
  checkout: CheckoutCheckout;
}
