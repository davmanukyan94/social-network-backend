import { Controller, Get, Query, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { SearchUserDto } from "./dto/search-user.dto";
import { UsersService } from "./users.service";

@Controller("client/")
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  async getMe(@Request() request) {
    return this.usersService.getOneOrFail(request.user.sub);
  }

  @Get("search")
  async search(@Query() searchParams: SearchUserDto) {
    return this.usersService.search(searchParams);
  }
}
