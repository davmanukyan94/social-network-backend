import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { UserEntity } from "src/users/entities/user.entity";
import { UserFriendEntity } from "./entities/user-friend.entity";
import { UserFriendsController } from "./user-friends.controller";
import { UserFriendsService } from "./user-friends.service";

@Module({
  imports: [MikroOrmModule.forFeature([UserFriendEntity, UserEntity])],
  controllers: [UserFriendsController],
  providers: [UserFriendsService],
  exports: [UserFriendsService],
})
export class UserFriendsModule {}
