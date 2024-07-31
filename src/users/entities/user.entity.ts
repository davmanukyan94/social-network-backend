import {
  Collection,
  Entity,
  EntityRepositoryType,
  OneToMany,
  Property,
  Unique,
} from "@mikro-orm/core";
import { DatabaseEntity } from "../../database/database.entity";
import { FriendRequestEntity } from "../../friend-requests/entities/friend-request.entity";
import { UserFriendEntity } from "../../user-friends/entities/user-friend.entity";
import { UsersRepository } from "../users.repository";

@Entity({ customRepository: () => UsersRepository, tableName: "users" })
export class UserEntity extends DatabaseEntity {
  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property()
  @Unique()
  email!: string;

  @Property({ hidden: true })
  password!: string;

  @Property()
  age!: number;

  @OneToMany(() => FriendRequestEntity, (fr) => fr.sender)
  sentFriendRequests = new Collection<FriendRequestEntity>(this);

  @OneToMany(() => FriendRequestEntity, (fr) => fr.receiver)
  receivedFriendRequests = new Collection<FriendRequestEntity>(this);

  @OneToMany(() => UserFriendEntity, (uf) => uf.user1)
  friendships1 = new Collection<UserFriendEntity>(this);

  @OneToMany(() => UserFriendEntity, (uf) => uf.user2)
  friendships2 = new Collection<UserFriendEntity>(this);

  [EntityRepositoryType]?: UsersRepository;
}
