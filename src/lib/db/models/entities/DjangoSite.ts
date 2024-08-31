import {
  Column,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SiteSitesettings } from "./SiteSitesettings";

@Index("django_site_domain_a2e37b91_uniq", ["domain"], { unique: true })
@Index("django_site_domain_a2e37b91_like", ["domain"], {})
@Index("django_site_pkey", ["id"], { unique: true })
@Entity("django_site", { schema: "public" })
export class DjangoSite {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "domain", unique: true, length: 100 })
  domain: string;

  @Column("character varying", { name: "name", length: 50 })
  name: string;

  @OneToOne(() => SiteSitesettings, (siteSitesettings) => siteSitesettings.site)
  siteSitesettings: SiteSitesettings;
}
