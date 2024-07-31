import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { compare, hash } from "bcrypt";
import { SignUpDto } from "../users/dto/sign-up.dto";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";

jest.mock("bcrypt");

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUserService = {
    getOneByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signUp", () => {
    it("should throw an exception if the user already exists", async () => {
      mockUserService.getOneByEmail.mockResolvedValue({});
      const dto: SignUpDto = {
        firstName: "test",
        lastName: "test",
        age: 11,
        email: "test@example.com",
        password: "password123",
      };

      await expect(authService.signUp(dto)).rejects.toThrow(
        new HttpException("User already exists", HttpStatus.NOT_ACCEPTABLE),
      );
    });

    it("should create a new user and return a token", async () => {
      mockUserService.getOneByEmail.mockResolvedValue(null);
      const hashedPassword = "hashedPassword";
      (hash as jest.Mock).mockResolvedValue(hashedPassword);

      const newUser = {
        id: "1",
        email: "test@example.com",
        password: hashedPassword,
      };
      mockUserService.create.mockResolvedValue(newUser);

      const token = "accessToken";
      mockJwtService.signAsync.mockResolvedValue(token);

      const dto: SignUpDto = {
        firstName: "test",
        lastName: "test",
        age: 11,
        email: "test@example.com",
        password: "password123",
      };

      const result = await authService.signUp(dto);

      expect(result).toEqual({ access_token: token });
      expect(usersService.create).toHaveBeenCalledWith({
        ...dto,
        password: hashedPassword,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: newUser.email,
        sub: newUser.id,
      });
    });
  });

  describe("signIn", () => {
    it("should throw an UnauthorizedException if the password does not match", async () => {
      const user = {
        id: "1",
        email: "test@example.com",
        password: "hashedPassword",
      };
      mockUserService.getOneByEmail.mockResolvedValue(user);

      (compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.signIn({
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should return a token if the credentials are valid", async () => {
      const user = {
        id: "1",
        email: "test@example.com",
        password: "hashedPassword",
      };
      mockUserService.getOneByEmail.mockResolvedValue(user);

      (compare as jest.Mock).mockResolvedValue(true);

      const token = "accessToken";
      mockJwtService.signAsync.mockResolvedValue(token);

      const result = await authService.signIn({
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toEqual({ access_token: token });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
    });
  });
});
