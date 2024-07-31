import { PartialType } from "@nestjs/swagger";
import { SignUpDto } from "./sign-up.dto";

export class UpdateUserDto extends PartialType(SignUpDto) {}
