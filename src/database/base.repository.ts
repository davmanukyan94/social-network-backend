import { EntityRepository } from "@mikro-orm/postgresql";
import { DatabaseEntity } from "./database.entity";

export class BaseRepository<
  T extends DatabaseEntity,
> extends EntityRepository<T> {}
