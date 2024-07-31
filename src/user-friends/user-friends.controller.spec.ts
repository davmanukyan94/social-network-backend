import { JwtModule, JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthGuard } from "../auth/auth.guard";
import { UserEntity } from "../users/entities/user.entity";
import { UserFriendsController } from "./user-friends.controller";
import { UserFriendsService } from "./user-friends.service";

describe("UserFriendsController", () => {
  let controller: UserFriendsController;
  let userFriendsService: UserFriendsService;

  const mockUserEntity: UserEntity = {
    id: "1",
    firstName: "test",
    lastName: "test",
    email: "test@email.com",
    password: "hashedpassword",
    age: 33,
    sentFriendRequests: [] as any,
    receivedFriendRequests: [] as any,
    friendships1: [] as any,
    friendships2: [] as any,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: "test-secret",
          signOptions: { expiresIn: "1d" },
        }),
      ],
      controllers: [UserFriendsController],
      providers: [
        UserFriendsService,
        {
          provide: UserFriendsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockUserEntity]),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue("token"),
          },
        },
        {
          provide: AuthGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
      ],
    }).compile();

    controller = module.get<UserFriendsController>(UserFriendsController);
    userFriendsService = module.get<UserFriendsService>(UserFriendsService);
  });

  describe("getAllFriends", () => {
    it("should return an empty array if the user has no friends", async () => {
      const request = { user: { sub: "user-id" } };
      const result: UserEntity[] = [];

      jest.spyOn(userFriendsService, "findAll").mockResolvedValue(result);

      expect(await controller.getAllFriends(request)).toEqual(result);
    });
    it("should return all friends for a given user", async () => {
      const request = { user: { sub: "user-id" } };
      const result = [mockUserEntity];

      jest.spyOn(userFriendsService, "findAll").mockResolvedValue(result);

      expect(await controller.getAllFriends(request)).toEqual(result);
    });
  });
});
