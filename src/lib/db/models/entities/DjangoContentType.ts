import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PermissionPermission } from "./PermissionPermission";

@Index(
  "django_content_type_app_label_model_76bd3d3b_uniq",
  ["appLabel", "model"],
  { unique: true }
)
@Index("django_content_type_pkey", ["id"], { unique: true })
@Entity("django_content_type", { schema: "public" })
export class DjangoContentType {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "app_label", unique: true, length: 100 })
  appLabel: string;

  @Column("character varying", { name: "model", unique: true, length: 100 })
  model: string;

  @OneToMany(
    () => PermissionPermission,
    (permissionPermission) => permissionPermission.contentType
  )
  permissionPermissions: PermissionPermission[];
}
