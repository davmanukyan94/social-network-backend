import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcrypt";
import { SALT } from "../constants";
import { SignUpDto } from "../users/dto/sign-up.dto";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto) {
    const user = await this.usersService.getOneByEmail(dto.email);
    if (user != null) {
      throw new HttpException("User already exists", HttpStatus.NOT_ACCEPTABLE);
    }
    dto.password = await hash(dto.password, SALT);
    const newUser = await this.usersService.create(dto);
    const payload = {
      email: newUser.email,
      sub: newUser.id,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signIn({ email, password }) {
    const user = await this.usersService.getOneByEmail(email);
    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException();
    }
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
