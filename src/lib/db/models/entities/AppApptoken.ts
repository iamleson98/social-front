import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AppApp } from "./AppApp";

@Index("account_serviceaccounttoken_service_account_id_a8e6dee8", ["appId"], {})
@Index(
  "account_serviceaccounttoken_auth_token_e4c38601_like",
  ["authToken"],
  {}
)
@Index("account_serviceaccounttoken_auth_token_key", ["authToken"], {
  unique: true,
})
@Index("account_serviceaccounttoken_pkey", ["id"], { unique: true })
@Entity("app_apptoken", { schema: "public" })
export class AppApptoken {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 128 })
  name: string;

  @Column("character varying", {
    name: "auth_token",
    unique: true,
    length: 128,
  })
  authToken: string;

  @Column("integer", { name: "app_id" })
  appId: number;

  @Column("character varying", { name: "token_last_4", length: 4 })
  tokenLast_4: string;

  @ManyToOne(() => AppApp, (appApp) => appApp.appApptokens)
  @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
  app: AppApp;
}
