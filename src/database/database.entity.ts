import { PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";

export abstract class DatabaseEntity {
  @PrimaryKey()
  id = v4();

  @Property({ type: "bigint" })
  createdAt = Date.now();

  @Property({ type: "bigint", onUpdate: () => Date.now() })
  updatedAt = Date.now();
}
