import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { FriendRequestsService } from "./friend-requests.service";

@Controller("client/requests/")
@UseGuards(AuthGuard)
export class FriendRequestsController {
  constructor(private readonly friendRequestService: FriendRequestsService) {}

  @Post("send")
  async sendFriendRequest(
    @Request() request,
    @Body() body: { receiverId: string },
  ) {
    return this.friendRequestService.sendFriendRequest(
      request.user.sub,
      body.receiverId,
    );
  }

  @Get()
  async getFriendRequests(@Request() request) {
    return this.friendRequestService.getFriendRequests(request.user.sub);
  }

  @Post(":requestId/accept")
  async acceptFriendRequest(
    @Request() request,
    @Param("requestId") requestId: string,
  ) {
    await this.friendRequestService.acceptFriendRequest(
      request.user.sub,
      requestId,
    );
    return { message: "Friend request accepted" };
  }

  @Post(":requestId/decline")
  async declineFriendRequest(
    @Request() request,
    @Param("requestId") requestId: string,
  ) {
    await this.friendRequestService.declineFriendRequest(
      requestId,
      request.user.sub,
    );
    return { message: "Friend request declined" };
  }
}
