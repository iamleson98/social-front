import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AttributeAssignedpageattributevalue } from "./AttributeAssignedpageattributevalue";
import { AttributeAttributevalue } from "./AttributeAttributevalue";
import { MenuMenuitem } from "./MenuMenuitem";
import { PagePagetype } from "./PagePagetype";
import { PagePagetranslation } from "./PagePagetranslation";

@Index("page_page_created_at_86e521f7", ["createdAt"], {})
@Index("page_page_pkey", ["id"], { unique: true })
@Index("page_meta_idx", ["metadata"], {})
@Index("page_page_page_type_id_06acc00e", ["pageTypeId"], {})
@Index("page_p_meta_idx", ["privateMetadata"], {})
@Index("page_page_slug_d6b7c8ed_like", ["slug"], {})
@Index("page_page_slug_key", ["slug"], { unique: true })
@Index("page_page_title_964714_gin", ["slug", "title"], {})
@Entity("page_page", { schema: "public" })
export class PagePage {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "slug", unique: true, length: 255 })
  slug: string;

  @Column("character varying", { name: "title", length: 250 })
  title: string;

  @Column("jsonb", { name: "content", nullable: true })
  content: object | null;

  @Column("timestamp with time zone", { name: "created_at" })
  createdAt: Date;

  @Column("boolean", { name: "is_published" })
  isPublished: boolean;

  @Column("timestamp with time zone", { name: "published_at", nullable: true })
  publishedAt: Date | null;

  @Column("character varying", {
    name: "seo_description",
    nullable: true,
    length: 300,
  })
  seoDescription: string | null;

  @Column("character varying", {
    name: "seo_title",
    nullable: true,
    length: 70,
  })
  seoTitle: string | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("integer", { name: "page_type_id" })
  pageTypeId: number;

  @OneToMany(
    () => AttributeAssignedpageattributevalue,
    (attributeAssignedpageattributevalue) =>
      attributeAssignedpageattributevalue.page
  )
  attributeAssignedpageattributevalues: AttributeAssignedpageattributevalue[];

  @OneToMany(
    () => AttributeAttributevalue,
    (attributeAttributevalue) => attributeAttributevalue.referencePage
  )
  attributeAttributevalues: AttributeAttributevalue[];

  @OneToMany(() => MenuMenuitem, (menuMenuitem) => menuMenuitem.page)
  menuMenuitems: MenuMenuitem[];

  @ManyToOne(() => PagePagetype, (pagePagetype) => pagePagetype.pagePages)
  @JoinColumn([{ name: "page_type_id", referencedColumnName: "id" }])
  pageType: PagePagetype;

  @OneToMany(
    () => PagePagetranslation,
    (pagePagetranslation) => pagePagetranslation.page
  )
  pagePagetranslations: PagePagetranslation[];
}
