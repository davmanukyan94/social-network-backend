import { Entity, EntityRepositoryType, Enum, ManyToOne } from "@mikro-orm/core";

import { DatabaseEntity } from "../../database/database.entity";
import { UserEntity } from "../../users/entities/user.entity";
import { FriendRequestsRepository } from "../friend-requests.repository";

export enum FriendRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
}

@Entity({
  customRepository: () => FriendRequestsRepository,
  tableName: "friend-requests",
})
export class FriendRequestEntity extends DatabaseEntity {
  @ManyToOne(() => UserEntity)
  sender!: UserEntity;

  @ManyToOne(() => UserEntity)
  receiver!: UserEntity;

  @Enum(() => FriendRequestStatus)
  status: FriendRequestStatus = FriendRequestStatus.PENDING;

  [EntityRepositoryType]?: FriendRequestsRepository;
}
