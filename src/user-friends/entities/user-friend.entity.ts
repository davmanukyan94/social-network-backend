import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  Unique,
} from "@mikro-orm/core";
import { DatabaseEntity } from "../../database/database.entity";
import { UserEntity } from "../../users/entities/user.entity";
import { UserFriendsRepository } from "../user-friends.repository";

@Entity({
  customRepository: () => UserFriendsRepository,
  tableName: "user-friends",
})
@Unique({ name: "friendship", properties: ["user1", "user2"] })
export class UserFriendEntity extends DatabaseEntity {
  @ManyToOne(() => UserEntity, { fieldName: "user1Id" })
  user1!: UserEntity;

  @ManyToOne(() => UserEntity, { fieldName: "user2Id" })
  user2!: UserEntity;

  [EntityRepositoryType]?: UserFriendsRepository;
}
