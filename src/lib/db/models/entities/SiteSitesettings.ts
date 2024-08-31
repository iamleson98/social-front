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
import { MenuMenu } from "./MenuMenu";
import { AccountAddress } from "./AccountAddress";
import { DjangoSite } from "./DjangoSite";
import { SiteSitesettingstranslation } from "./SiteSitesettingstranslation";

@Index("site_sitesettings_bottom_menu_id_e2a78098", ["bottomMenuId"], {})
@Index(
  "site_sitesettings_company_address_id_f0825427",
  ["companyAddressId"],
  {}
)
@Index("site_sitesettings_pkey", ["id"], { unique: true })
@Index("site_sitesettings_site_id_key", ["siteId"], { unique: true })
@Index("site_sitesettings_top_menu_id_ab6f8c46", ["topMenuId"], {})
@Entity("site_sitesettings", { schema: "public" })
export class SiteSitesettings {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "header_text", length: 200 })
  headerText: string;

  @Column("character varying", { name: "description", length: 500 })
  description: string;

  @Column("integer", { name: "site_id", unique: true })
  siteId: number;

  @Column("integer", { name: "bottom_menu_id", nullable: true })
  bottomMenuId: number | null;

  @Column("integer", { name: "top_menu_id", nullable: true })
  topMenuId: number | null;

  @Column("boolean", { name: "display_gross_prices" })
  displayGrossPrices: boolean;

  @Column("boolean", { name: "include_taxes_in_prices" })
  includeTaxesInPrices: boolean;

  @Column("boolean", { name: "charge_taxes_on_shipping" })
  chargeTaxesOnShipping: boolean;

  @Column("boolean", { name: "track_inventory_by_default" })
  trackInventoryByDefault: boolean;

  @Column("character varying", { name: "default_weight_unit", length: 30 })
  defaultWeightUnit: string;

  @Column("boolean", { name: "automatic_fulfillment_digital_products" })
  automaticFulfillmentDigitalProducts: boolean;

  @Column("integer", { name: "default_digital_max_downloads", nullable: true })
  defaultDigitalMaxDownloads: number | null;

  @Column("integer", { name: "default_digital_url_valid_days", nullable: true })
  defaultDigitalUrlValidDays: number | null;

  @Column("integer", { name: "company_address_id", nullable: true })
  companyAddressId: number | null;

  @Column("character varying", {
    name: "default_mail_sender_address",
    nullable: true,
    length: 254,
  })
  defaultMailSenderAddress: string | null;

  @Column("character varying", { name: "default_mail_sender_name", length: 78 })
  defaultMailSenderName: string;

  @Column("character varying", {
    name: "customer_set_password_url",
    nullable: true,
    length: 255,
  })
  customerSetPasswordUrl: string | null;

  @Column("boolean", { name: "fulfillment_allow_unpaid" })
  fulfillmentAllowUnpaid: boolean;

  @Column("boolean", { name: "fulfillment_auto_approve" })
  fulfillmentAutoApprove: boolean;

  @Column("integer", { name: "gift_card_expiry_period", nullable: true })
  giftCardExpiryPeriod: number | null;

  @Column("character varying", {
    name: "gift_card_expiry_period_type",
    nullable: true,
    length: 32,
  })
  giftCardExpiryPeriodType: string | null;

  @Column("character varying", { name: "gift_card_expiry_type", length: 32 })
  giftCardExpiryType: string;

  @Column("integer", {
    name: "reserve_stock_duration_anonymous_user",
    nullable: true,
  })
  reserveStockDurationAnonymousUser: number | null;

  @Column("integer", {
    name: "reserve_stock_duration_authenticated_user",
    nullable: true,
  })
  reserveStockDurationAuthenticatedUser: number | null;

  @Column("integer", { name: "limit_quantity_per_checkout", nullable: true })
  limitQuantityPerCheckout: number | null;

  @Column("boolean", {
    name: "enable_account_confirmation_by_email",
    default: () => "true",
  })
  enableAccountConfirmationByEmail: boolean;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("boolean", {
    name: "allow_login_without_confirmation",
    default: () => "false",
  })
  allowLoginWithoutConfirmation: boolean;

  @ManyToOne(() => MenuMenu, (menuMenu) => menuMenu.siteSitesettings)
  @JoinColumn([{ name: "bottom_menu_id", referencedColumnName: "id" }])
  bottomMenu: MenuMenu;

  @ManyToOne(
    () => AccountAddress,
    (accountAddress) => accountAddress.siteSitesettings
  )
  @JoinColumn([{ name: "company_address_id", referencedColumnName: "id" }])
  companyAddress: AccountAddress;

  @OneToOne(() => DjangoSite, (djangoSite) => djangoSite.siteSitesettings)
  @JoinColumn([{ name: "site_id", referencedColumnName: "id" }])
  site: DjangoSite;

  @ManyToOne(() => MenuMenu, (menuMenu) => menuMenu.siteSitesettings2)
  @JoinColumn([{ name: "top_menu_id", referencedColumnName: "id" }])
  topMenu: MenuMenu;

  @OneToMany(
    () => SiteSitesettingstranslation,
    (siteSitesettingstranslation) => siteSitesettingstranslation.siteSettings
  )
  siteSitesettingstranslations: SiteSitesettingstranslation[];
}
