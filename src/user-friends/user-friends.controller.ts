import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { UserFriendsService } from "./user-friends.service";

@Controller("client/friends")
@UseGuards(AuthGuard)
export class UserFriendsController {
  constructor(private readonly userFriendsService: UserFriendsService) {}

  @Get()
  async getAllFriends(@Request() request) {
    return this.userFriendsService.findAll(request.user.sub);
  }
}
