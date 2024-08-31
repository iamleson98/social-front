import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AccountUser } from "./AccountUser";
import { AccountUserAddresses } from "./AccountUserAddresses";
import { CheckoutCheckout } from "./CheckoutCheckout";
import { OrderOrder } from "./OrderOrder";
import { SiteSitesettings } from "./SiteSitesettings";
import { WarehouseWarehouse } from "./WarehouseWarehouse";

@Index(
  "warehouse_address_search_gin",
  [
    "city",
    "companyName",
    "phone",
    "postalCode",
    "streetAddress_1",
    "streetAddress_2",
  ],
  {}
)
@Index("address_search_gin", ["city", "country", "firstName", "lastName"], {})
@Index("userprofile_address_pkey", ["id"], { unique: true })
@Index("address_meta_idx", ["metadata"], {})
@Index("account_address_phone_7966e995", ["phone"], {})
@Index("account_address_phone_7966e995_like", ["phone"], {})
@Index("address_p_meta_idx", ["privateMetadata"], {})
@Entity("account_address", { schema: "public" })
export class AccountAddress {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "first_name", length: 256 })
  firstName: string;

  @Column("character varying", { name: "last_name", length: 256 })
  lastName: string;

  @Column("character varying", { name: "company_name", length: 256 })
  companyName: string;

  @Column("character varying", { name: "street_address_1", length: 256 })
  streetAddress_1: string;

  @Column("character varying", { name: "street_address_2", length: 256 })
  streetAddress_2: string;

  @Column("character varying", { name: "city", length: 256 })
  city: string;

  @Column("character varying", { name: "postal_code", length: 20 })
  postalCode: string;

  @Column("character varying", { name: "country", length: 2 })
  country: string;

  @Column("character varying", { name: "country_area", length: 128 })
  countryArea: string;

  @Column("character varying", { name: "phone", length: 128 })
  phone: string;

  @Column("character varying", { name: "city_area", length: 128 })
  cityArea: string;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("boolean", { name: "validation_skipped", default: () => "false" })
  validationSkipped: boolean;

  @OneToMany(
    () => AccountUser,
    (accountUser) => accountUser.defaultBillingAddress
  )
  accountUsers: AccountUser[];

  @OneToMany(
    () => AccountUser,
    (accountUser) => accountUser.defaultShippingAddress
  )
  accountUsers2: AccountUser[];

  @OneToMany(
    () => AccountUserAddresses,
    (accountUserAddresses) => accountUserAddresses.address
  )
  accountUserAddresses: AccountUserAddresses[];

  @OneToMany(
    () => CheckoutCheckout,
    (checkoutCheckout) => checkoutCheckout.billingAddress
  )
  checkoutCheckouts: CheckoutCheckout[];

  @OneToMany(
    () => CheckoutCheckout,
    (checkoutCheckout) => checkoutCheckout.shippingAddress
  )
  checkoutCheckouts2: CheckoutCheckout[];

  @OneToMany(() => OrderOrder, (orderOrder) => orderOrder.billingAddress)
  orderOrders: OrderOrder[];

  @OneToMany(() => OrderOrder, (orderOrder) => orderOrder.shippingAddress)
  orderOrders2: OrderOrder[];

  @OneToMany(
    () => SiteSitesettings,
    (siteSitesettings) => siteSitesettings.companyAddress
  )
  siteSitesettings: SiteSitesettings[];

  @OneToMany(
    () => WarehouseWarehouse,
    (warehouseWarehouse) => warehouseWarehouse.address
  )
  warehouseWarehouses: WarehouseWarehouse[];
}
