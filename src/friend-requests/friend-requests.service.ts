import { EntityManager, NotFoundError } from "@mikro-orm/core";
import { Injectable, NotAcceptableException } from "@nestjs/common";
import {
  FriendRequestEntity,
  FriendRequestStatus,
} from "../friend-requests/entities/friend-request.entity";
import { UserEntity } from "../users/entities/user.entity";
import { UserFriendsService } from "./../user-friends/user-friends.service";

@Injectable()
export class FriendRequestsService {
  constructor(
    private readonly em: EntityManager,
    private readonly UserFriendsService: UserFriendsService,
  ) {}

  async sendFriendRequest(
    senderId: string,
    receiverId: string,
  ): Promise<FriendRequestEntity> {
    if (senderId === receiverId) {
      throw new NotAcceptableException(
        "You can't send friend request to yourself",
      );
    }
    const [sender, receiver] = await Promise.all([
      this.em.findOne(UserEntity, { id: senderId }),
      this.em.findOne(UserEntity, { id: receiverId }),
    ]);
    if (!sender || !receiver) {
      throw new NotFoundError("Sender or receiver not found");
    }
    const userFriends = await this.UserFriendsService.findAll(senderId);
    if (userFriends.length > 0) {
      throw new NotAcceptableException(
        "You are already friends with this user",
      );
    }
    const existingRequest = await this.em.findOne(FriendRequestEntity, {
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    });

    if (existingRequest) {
      if (existingRequest.status === FriendRequestStatus.PENDING) {
        throw new NotAcceptableException(
          "Pending friend request already exists",
        );
      }
      await this.em.nativeUpdate(
        FriendRequestEntity,
        { id: existingRequest.id },
        { status: FriendRequestStatus.PENDING, updatedAt: Date.now() },
      );

      return { ...existingRequest, status: FriendRequestStatus.PENDING };
    }
    const newFriendRequest = this.em.create(FriendRequestEntity, {
      sender,
      receiver,
    });
    await this.em.persistAndFlush(newFriendRequest);

    return newFriendRequest;
  }

  async getFriendRequests(userId: string): Promise<FriendRequestEntity[]> {
    const user = await this.em.findOne(
      UserEntity,
      { id: userId },
      { populate: ["receivedFriendRequests"] },
    );
    const friendRequests = await this.em.find(
      FriendRequestEntity,
      { receiver: user, status: FriendRequestStatus.PENDING },
      {
        populate: ["sender"],
        fields: [
          "sender.id",
          "sender.firstName",
          "sender.lastName",
          "sender.email",
          "sender.age",
        ],
      },
    );
    return friendRequests;
  }

  async acceptFriendRequest(userId: string, requestId: string) {
    const friendRequest = await this.em.findOne(
      FriendRequestEntity,
      requestId,
      { populate: ["sender"] },
    );

    if (!friendRequest) {
      throw new NotFoundError("Friend request not found");
    }
    const user2Id = friendRequest.sender["id"];
    await Promise.all([
      this.UserFriendsService.create({
        user1Id: userId,
        user2Id,
      }),
      this.em.nativeUpdate(
        FriendRequestEntity,
        { id: requestId },
        { status: FriendRequestStatus.ACCEPTED },
      ),
    ]);

    return { message: "accepted" };
  }

  async declineFriendRequest(userId: string, requestId: string) {
    const friendRequest = await this.em.findOne(
      FriendRequestEntity,
      requestId,
      { populate: ["sender"] },
    );
    if (
      !friendRequest ||
      friendRequest.status !== FriendRequestStatus.PENDING
    ) {
      throw new NotFoundError("Friend request not found");
    }
    await this.em.nativeUpdate(
      FriendRequestEntity,
      { id: requestId },
      { status: FriendRequestStatus.DECLINED },
    );

    return { message: "declined" };
  }
}
