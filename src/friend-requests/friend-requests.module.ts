import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { UserFriendsModule } from "src/user-friends/user-friends.module";
import { UserEntity } from "src/users/entities/user.entity";
import { FriendRequestEntity } from "./entities/friend-request.entity";
import { FriendRequestsController } from "./friend-requests.controller";
import { FriendRequestsService } from "./friend-requests.service";

@Module({
  imports: [
    MikroOrmModule.forFeature([FriendRequestEntity, UserEntity]),
    UserFriendsModule,
  ],
  controllers: [FriendRequestsController],
  providers: [FriendRequestsService],
})
export class FriendRequestsModule {}
