import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateUserFriendDto {
  @ApiProperty()
  @IsString()
  user1Id: string;

  @ApiProperty()
  @IsString()
  user2Id: string;
}
