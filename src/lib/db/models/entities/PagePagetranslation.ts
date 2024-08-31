import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PagePage } from "./PagePage";

@Index("page_pagetranslation_pkey", ["id"], { unique: true })
@Index(
  "page_pagetranslation_language_code_page_id_35685962_uniq",
  ["languageCode", "pageId"],
  { unique: true }
)
@Index("page_pagetranslation_page_id_60216ef5", ["pageId"], {})
@Entity("page_pagetranslation", { schema: "public" })
export class PagePagetranslation {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "seo_title",
    nullable: true,
    length: 70,
  })
  seoTitle: string | null;

  @Column("character varying", {
    name: "seo_description",
    nullable: true,
    length: 300,
  })
  seoDescription: string | null;

  @Column("character varying", {
    name: "language_code",
    unique: true,
    length: 35,
  })
  languageCode: string;

  @Column("character varying", { name: "title", nullable: true, length: 255 })
  title: string | null;

  @Column("jsonb", { name: "content", nullable: true })
  content: object | null;

  @Column("integer", { name: "page_id", unique: true })
  pageId: number;

  @ManyToOne(() => PagePage, (pagePage) => pagePage.pagePagetranslations)
  @JoinColumn([{ name: "page_id", referencedColumnName: "id" }])
  page: PagePage;
}
