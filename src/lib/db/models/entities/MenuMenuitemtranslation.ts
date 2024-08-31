import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MenuMenuitem } from "./MenuMenuitem";

@Index("menu_menuitemtranslation_pkey", ["id"], { unique: true })
@Index(
  "menu_menuitemtranslation_language_code_menu_item__508dcdd8_uniq",
  ["languageCode", "menuItemId"],
  { unique: true }
)
@Index("menu_menuitemtranslation_menu_item_id_3445926c", ["menuItemId"], {})
@Entity("menu_menuitemtranslation", { schema: "public" })
export class MenuMenuitemtranslation {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "language_code",
    unique: true,
    length: 35,
  })
  languageCode: string;

  @Column("character varying", { name: "name", length: 128 })
  name: string;

  @Column("integer", { name: "menu_item_id", unique: true })
  menuItemId: number;

  @ManyToOne(
    () => MenuMenuitem,
    (menuMenuitem) => menuMenuitem.menuMenuitemtranslations
  )
  @JoinColumn([{ name: "menu_item_id", referencedColumnName: "id" }])
  menuItem: MenuMenuitem;
}
