import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { SignUpDto } from "../users/dto/sign-up.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post("/signup")
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post("/signin")
  signIn(@Body() body: { email: string; password: string }) {
    return this.authService.signIn(body);
  }
}
