import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SiteSitesettings } from "./SiteSitesettings";

@Index("site_sitesettingstranslation_pkey", ["id"], { unique: true })
@Index(
  "site_sitesettingstransla_language_code_site_setti_e767d9e7_uniq",
  ["languageCode", "siteSettingsId"],
  { unique: true }
)
@Index(
  "site_sitesettingstranslation_site_settings_id_ca085ff6",
  ["siteSettingsId"],
  {}
)
@Entity("site_sitesettingstranslation", { schema: "public" })
export class SiteSitesettingstranslation {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "language_code",
    unique: true,
    length: 35,
  })
  languageCode: string;

  @Column("character varying", { name: "header_text", length: 200 })
  headerText: string;

  @Column("character varying", { name: "description", length: 500 })
  description: string;

  @Column("integer", { name: "site_settings_id", unique: true })
  siteSettingsId: number;

  @ManyToOne(
    () => SiteSitesettings,
    (siteSitesettings) => siteSitesettings.siteSitesettingstranslations
  )
  @JoinColumn([{ name: "site_settings_id", referencedColumnName: "id" }])
  siteSettings: SiteSitesettings;
}
