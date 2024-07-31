import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { UserEntity } from "../users/entities/user.entity";
import { CreateUserFriendDto } from "./dto/create-user-friend.dto";
import { UserFriendEntity } from "./entities/user-friend.entity";
import { UserFriendsRepository } from "./user-friends.repository";

@Injectable()
export class UserFriendsService {
  constructor(
    private readonly userFriendsRepository: UserFriendsRepository,
    private readonly em: EntityManager,
  ) {}
  async create(
    createUserFriendDto: CreateUserFriendDto,
  ): Promise<UserFriendEntity> {
    const user = this.userFriendsRepository.create({
      ...createUserFriendDto,
      user1: createUserFriendDto.user1Id,
      user2: createUserFriendDto.user2Id,
    });

    await this.em.persistAndFlush(user);

    return user;
  }

  async findAll(userId: string): Promise<UserEntity[]> {
    const userFriends = await this.userFriendsRepository.find({
      $or: [{ user1: userId }, { user2: userId }],
    });
    const friends = await Promise.all(
      userFriends.map((userFriend) =>
        userFriend.user1.id === userId
          ? this.em.findOne(UserEntity, { id: userFriend.user2.id })
          : this.em.findOne(UserEntity, { id: userFriend.user1.id }),
      ),
    );
    return friends;
  }
}
