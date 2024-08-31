import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductCategory } from "./ProductCategory";
import { ProductCollection } from "./ProductCollection";
import { MenuMenu } from "./MenuMenu";
import { PagePage } from "./PagePage";
import { MenuMenuitemtranslation } from "./MenuMenuitemtranslation";

@Index("menu_menuitem_category_id_af353a3b", ["categoryId"], {})
@Index("menu_menuitem_collection_id_b913b19e", ["collectionId"], {})
@Index("menu_menuitem_pkey", ["id"], { unique: true })
@Index("menu_menuitem_menu_id_f466b139", ["menuId"], {})
@Index("menuitem_meta_idx", ["metadata"], {})
@Index("menu_menuitem_page_id_a0c8f92d", ["pageId"], {})
@Index("menu_menuitem_parent_id_439f55a5", ["parentId"], {})
@Index("menuitem_p_meta_idx", ["privateMetadata"], {})
@Index("menu_menuitem_sort_order_f96ed184", ["sortOrder"], {})
@Index("menu_menuitem_tree_id_0d2e9c9a", ["treeId"], {})
@Entity("menu_menuitem", { schema: "public" })
export class MenuMenuitem {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 128 })
  name: string;

  @Column("integer", { name: "sort_order", nullable: true })
  sortOrder: number | null;

  @Column("character varying", { name: "url", nullable: true, length: 256 })
  url: string | null;

  @Column("integer", { name: "lft" })
  lft: number;

  @Column("integer", { name: "rght" })
  rght: number;

  @Column("integer", { name: "tree_id" })
  treeId: number;

  @Column("integer", { name: "level" })
  level: number;

  @Column("integer", { name: "category_id", nullable: true })
  categoryId: number | null;

  @Column("integer", { name: "collection_id", nullable: true })
  collectionId: number | null;

  @Column("integer", { name: "menu_id" })
  menuId: number;

  @Column("integer", { name: "page_id", nullable: true })
  pageId: number | null;

  @Column("integer", { name: "parent_id", nullable: true })
  parentId: number | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @ManyToOne(
    () => ProductCategory,
    (productCategory) => productCategory.menuMenuitems
  )
  @JoinColumn([{ name: "category_id", referencedColumnName: "id" }])
  category: ProductCategory;

  @ManyToOne(
    () => ProductCollection,
    (productCollection) => productCollection.menuMenuitems
  )
  @JoinColumn([{ name: "collection_id", referencedColumnName: "id" }])
  collection: ProductCollection;

  @ManyToOne(() => MenuMenu, (menuMenu) => menuMenu.menuMenuitems)
  @JoinColumn([{ name: "menu_id", referencedColumnName: "id" }])
  menu: MenuMenu;

  @ManyToOne(() => PagePage, (pagePage) => pagePage.menuMenuitems)
  @JoinColumn([{ name: "page_id", referencedColumnName: "id" }])
  page: PagePage;

  @ManyToOne(() => MenuMenuitem, (menuMenuitem) => menuMenuitem.menuMenuitems)
  @JoinColumn([{ name: "parent_id", referencedColumnName: "id" }])
  parent: MenuMenuitem;

  @OneToMany(() => MenuMenuitem, (menuMenuitem) => menuMenuitem.parent)
  menuMenuitems: MenuMenuitem[];

  @OneToMany(
    () => MenuMenuitemtranslation,
    (menuMenuitemtranslation) => menuMenuitemtranslation.menuItem
  )
  menuMenuitemtranslations: MenuMenuitemtranslation[];
}
