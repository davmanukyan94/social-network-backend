import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { SignUpDto } from "../users/dto/sign-up.dto";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signUp", () => {
    it("should return an access token when sign up is successful", async () => {
      const dto: SignUpDto = {
        firstName: "test",
        lastName: "test",
        age: 11,
        email: "test@example.com",
        password: "password123",
      };
      const result = { access_token: "accessToken" };
      mockAuthService.signUp.mockResolvedValue(result);

      const response = await authController.signUp(dto);

      expect(response).toEqual(result);
      expect(authService.signUp).toHaveBeenCalledWith(dto);
    });

    it("should throw an HttpException when sign up fails", async () => {
      const dto: SignUpDto = {
        firstName: "test",
        lastName: "test",
        age: 11,
        email: "test@example.com",
        password: "password123",
      };
      mockAuthService.signUp.mockRejectedValue(
        new HttpException("User already exists", HttpStatus.NOT_ACCEPTABLE),
      );

      await expect(authController.signUp(dto)).rejects.toThrow(
        new HttpException("User already exists", HttpStatus.NOT_ACCEPTABLE),
      );
    });
  });

  describe("signIn", () => {
    it("should return an access token when sign in is successful", async () => {
      const body = { email: "test@example.com", password: "password123" };
      const result = { access_token: "accessToken" };
      mockAuthService.signIn.mockResolvedValue(result);

      const response = await authController.signIn(body);

      expect(response).toEqual(result);
      expect(authService.signIn).toHaveBeenCalledWith(body);
    });

    it("should throw an UnauthorizedException when sign in fails", async () => {
      const body = { email: "test@example.com", password: "password123" };
      mockAuthService.signIn.mockRejectedValue(
        new UnauthorizedException("Invalid credentials"),
      );

      await expect(authController.signIn(body)).rejects.toThrow(
        new UnauthorizedException("Invalid credentials"),
      );
    });
  });
});
