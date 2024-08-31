import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AttributeAttributepage } from "./AttributeAttributepage";
import { PagePage } from "./PagePage";

@Index("page_pagetype_pkey", ["id"], { unique: true })
@Index("pagetype_meta_idx", ["metadata"], {})
@Index("page_pagety_name_7c1cb8_gin", ["name", "slug"], {})
@Index("pagetype_p_meta_idx", ["privateMetadata"], {})
@Index("page_pagetype_slug_dc1e7a3f_like", ["slug"], {})
@Index("page_pagetype_slug_key", ["slug"], { unique: true })
@Entity("page_pagetype", { schema: "public" })
export class PagePagetype {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("jsonb", { name: "private_metadata", nullable: true })
  privateMetadata: object | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("character varying", { name: "name", length: 250 })
  name: string;

  @Column("character varying", { name: "slug", unique: true, length: 255 })
  slug: string;

  @OneToMany(
    () => AttributeAttributepage,
    (attributeAttributepage) => attributeAttributepage.pageType
  )
  attributeAttributepages: AttributeAttributepage[];

  @OneToMany(() => PagePage, (pagePage) => pagePage.pageType)
  pagePages: PagePage[];
}
