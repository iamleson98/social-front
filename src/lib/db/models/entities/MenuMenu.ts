import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MenuMenuitem } from "./MenuMenuitem";
import { SiteSitesettings } from "./SiteSitesettings";

@Index("menu_menu_pkey", ["id"], { unique: true })
@Index("menu_meta_idx", ["metadata"], {})
@Index("menu_p_meta_idx", ["privateMetadata"], {})
@Index("menu_menu_slug_98939c4e_like", ["slug"], {})
@Index("menu_menu_slug_key", ["slug"], { unique: true })
@Entity("menu_menu", { schema: "public" })
export class MenuMenu {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 250 })
  name: string;

  @Column("character varying", { name: "slug", unique: true, length: 255 })
  slug: string;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @OneToMany(() => MenuMenuitem, (menuMenuitem) => menuMenuitem.menu)
  menuMenuitems: MenuMenuitem[];

  @OneToMany(
    () => SiteSitesettings,
    (siteSitesettings) => siteSitesettings.bottomMenu
  )
  siteSitesettings: SiteSitesettings[];

  @OneToMany(
    () => SiteSitesettings,
    (siteSitesettings) => siteSitesettings.topMenu
  )
  siteSitesettings2: SiteSitesettings[];
}
