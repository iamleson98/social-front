import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AccountCustomerevent } from "./AccountCustomerevent";
import { AccountCustomernote } from "./AccountCustomernote";
import { AccountStaffnotificationrecipient } from "./AccountStaffnotificationrecipient";
import { AccountAddress } from "./AccountAddress";
import { AccountUserAddresses } from "./AccountUserAddresses";
import { AccountUserGroups } from "./AccountUserGroups";
import { AccountUserUserPermissions } from "./AccountUserUserPermissions";
import { CheckoutCheckout } from "./CheckoutCheckout";
import { CsvExportevent } from "./CsvExportevent";
import { CsvExportfile } from "./CsvExportfile";
import { DiscountPromotionevent } from "./DiscountPromotionevent";
import { GiftcardGiftcard } from "./GiftcardGiftcard";
import { GiftcardGiftcardevent } from "./GiftcardGiftcardevent";
import { InvoiceInvoiceevent } from "./InvoiceInvoiceevent";
import { OrderOrder } from "./OrderOrder";
import { OrderOrderevent } from "./OrderOrderevent";
import { OrderOrdergrantedrefund } from "./OrderOrdergrantedrefund";
import { PaymentTransactionevent } from "./PaymentTransactionevent";
import { PaymentTransactionitem } from "./PaymentTransactionitem";
import { ThumbnailThumbnail } from "./ThumbnailThumbnail";

@Index(
  "userprofile_user_default_billing_address_id_0489abf1",
  ["defaultBillingAddressId"],
  {}
)
@Index(
  "userprofile_user_default_shipping_address_id_aae7a203",
  ["defaultShippingAddressId"],
  {}
)
@Index("userprofile_user_email_b0fb0137_like", ["email"], {})
@Index("order_user_search_gin", ["email", "firstName", "lastName"], {})
@Index("userprofile_user_email_key", ["email"], { unique: true })
@Index(
  "account_user_external_reference_ba2fbb61_like",
  ["externalReference"],
  {}
)
@Index("account_user_external_reference_key", ["externalReference"], {
  unique: true,
})
@Index("first_name_gin", ["firstName"], {})
@Index("userprofile_user_pkey", ["id"], { unique: true })
@Index("last_name_gin", ["lastName"], {})
@Index("user_meta_idx", ["metadata"], {})
@Index("user_p_meta_jsonb_path_idx", ["privateMetadata"], {})
@Index("user_p_meta_idx", ["privateMetadata"], {})
@Index("user_search_gin", ["searchDocument"], {})
@Index("account_user_updated_at_d33bcfd6", ["updatedAt"], {})
@Index("account_user_uuid_b4063ea1_uniq", ["uuid"], { unique: true })
@Entity("account_user", { schema: "public" })
export class AccountUser {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("boolean", { name: "is_superuser" })
  isSuperuser: boolean;

  @Column("character varying", { name: "email", unique: true, length: 254 })
  email: string;

  @Column("boolean", { name: "is_staff" })
  isStaff: boolean;

  @Column("boolean", { name: "is_active" })
  isActive: boolean;

  @Column("character varying", { name: "password", length: 128 })
  password: string;

  @Column("timestamp with time zone", { name: "date_joined" })
  dateJoined: Date;

  @Column("timestamp with time zone", { name: "last_login", nullable: true })
  lastLogin: Date | null;

  @Column("integer", { name: "default_billing_address_id", nullable: true })
  defaultBillingAddressId: number | null;

  @Column("integer", { name: "default_shipping_address_id", nullable: true })
  defaultShippingAddressId: number | null;

  @Column("text", { name: "note", nullable: true })
  note: string | null;

  @Column("character varying", { name: "first_name", length: 256 })
  firstName: string;

  @Column("character varying", { name: "last_name", length: 256 })
  lastName: string;

  @Column("character varying", { name: "avatar", nullable: true, length: 100 })
  avatar: string | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("character varying", { name: "jwt_token_key", length: 12 })
  jwtTokenKey: string;

  @Column("character varying", { name: "language_code", length: 35 })
  languageCode: string;

  @Column("text", { name: "search_document" })
  searchDocument: string;

  @Column("timestamp with time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("uuid", { name: "uuid", unique: true })
  uuid: string;

  @Column("character varying", {
    name: "external_reference",
    nullable: true,
    unique: true,
    length: 250,
  })
  externalReference: string | null;

  @Column("timestamp with time zone", {
    name: "last_password_reset_request",
    nullable: true,
  })
  lastPasswordResetRequest: Date | null;

  @Column("boolean", { name: "is_confirmed", default: () => "true" })
  isConfirmed: boolean;

  @Column("timestamp with time zone", {
    name: "last_confirm_email_request",
    nullable: true,
  })
  lastConfirmEmailRequest: Date | null;

  @OneToMany(
    () => AccountCustomerevent,
    (accountCustomerevent) => accountCustomerevent.user
  )
  accountCustomerevents: AccountCustomerevent[];

  @OneToMany(
    () => AccountCustomernote,
    (accountCustomernote) => accountCustomernote.customer
  )
  accountCustomernotes: AccountCustomernote[];

  @OneToMany(
    () => AccountCustomernote,
    (accountCustomernote) => accountCustomernote.user
  )
  accountCustomernotes2: AccountCustomernote[];

  @OneToOne(
    () => AccountStaffnotificationrecipient,
    (accountStaffnotificationrecipient) =>
      accountStaffnotificationrecipient.user
  )
  accountStaffnotificationrecipient: AccountStaffnotificationrecipient;

  @ManyToOne(
    () => AccountAddress,
    (accountAddress) => accountAddress.accountUsers
  )
  @JoinColumn([
    { name: "default_billing_address_id", referencedColumnName: "id" },
  ])
  defaultBillingAddress: AccountAddress;

  @ManyToOne(
    () => AccountAddress,
    (accountAddress) => accountAddress.accountUsers2
  )
  @JoinColumn([
    { name: "default_shipping_address_id", referencedColumnName: "id" },
  ])
  defaultShippingAddress: AccountAddress;

  @OneToMany(
    () => AccountUserAddresses,
    (accountUserAddresses) => accountUserAddresses.user
  )
  accountUserAddresses: AccountUserAddresses[];

  @OneToMany(
    () => AccountUserGroups,
    (accountUserGroups) => accountUserGroups.user
  )
  accountUserGroups: AccountUserGroups[];

  @OneToMany(
    () => AccountUserUserPermissions,
    (accountUserUserPermissions) => accountUserUserPermissions.user
  )
  accountUserUserPermissions: AccountUserUserPermissions[];

  @OneToMany(
    () => CheckoutCheckout,
    (checkoutCheckout) => checkoutCheckout.user
  )
  checkoutCheckouts: CheckoutCheckout[];

  @OneToMany(() => CsvExportevent, (csvExportevent) => csvExportevent.user)
  csvExportevents: CsvExportevent[];

  @OneToMany(() => CsvExportfile, (csvExportfile) => csvExportfile.user)
  csvExportfiles: CsvExportfile[];

  @OneToMany(
    () => DiscountPromotionevent,
    (discountPromotionevent) => discountPromotionevent.user
  )
  discountPromotionevents: DiscountPromotionevent[];

  @OneToMany(
    () => GiftcardGiftcard,
    (giftcardGiftcard) => giftcardGiftcard.createdBy
  )
  giftcardGiftcards: GiftcardGiftcard[];

  @OneToMany(
    () => GiftcardGiftcard,
    (giftcardGiftcard) => giftcardGiftcard.usedBy
  )
  giftcardGiftcards2: GiftcardGiftcard[];

  @OneToMany(
    () => GiftcardGiftcardevent,
    (giftcardGiftcardevent) => giftcardGiftcardevent.user
  )
  giftcardGiftcardevents: GiftcardGiftcardevent[];

  @OneToMany(
    () => InvoiceInvoiceevent,
    (invoiceInvoiceevent) => invoiceInvoiceevent.user
  )
  invoiceInvoiceevents: InvoiceInvoiceevent[];

  @OneToMany(() => OrderOrder, (orderOrder) => orderOrder.user)
  orderOrders: OrderOrder[];

  @OneToMany(() => OrderOrderevent, (orderOrderevent) => orderOrderevent.user)
  orderOrderevents: OrderOrderevent[];

  @OneToMany(
    () => OrderOrdergrantedrefund,
    (orderOrdergrantedrefund) => orderOrdergrantedrefund.user
  )
  orderOrdergrantedrefunds: OrderOrdergrantedrefund[];

  @OneToMany(
    () => PaymentTransactionevent,
    (paymentTransactionevent) => paymentTransactionevent.user
  )
  paymentTransactionevents: PaymentTransactionevent[];

  @OneToMany(
    () => PaymentTransactionitem,
    (paymentTransactionitem) => paymentTransactionitem.user
  )
  paymentTransactionitems: PaymentTransactionitem[];

  @OneToMany(
    () => ThumbnailThumbnail,
    (thumbnailThumbnail) => thumbnailThumbnail.user
  )
  thumbnailThumbnails: ThumbnailThumbnail[];
}
