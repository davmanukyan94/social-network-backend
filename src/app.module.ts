import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { AllExceptionsFilter } from "./exceptions/all-exception.filter";
import { FriendRequestsModule } from "./friend-requests/friend-requests.module";
import { UserFriendsModule } from "./user-friends/user-friends.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    UsersModule,
    AuthModule,
    FriendRequestsModule,
    UserFriendsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
