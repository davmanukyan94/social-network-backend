import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthGuard } from "../auth/auth.guard";
import { UserFriendsController } from "./user-friends.controller";
import { UserFriendsService } from "./user-friends.service";

describe("UserFriendsController", () => {
  let controller: UserFriendsController;
  let userFriendsService: UserFriendsService;

  const mockUserFriendsService = {
    findAll: jest.fn(),
  };

  const mockJwtService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserFriendsController],
      providers: [
        { provide: UserFriendsService, useValue: mockUserFriendsService },
        {
          provide: JwtService,
          useValue: mockJwtService,
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllFriends", () => {
    it("should return all friends for a given user", async () => {
      const userId = "user-id";
      const friends = [
        {
          id: "friend-id-1",
          firstName: "Jane",
          lastName: "Doe",
          email: "jane.doe@example.com",
          age: 28,
        },
        {
          id: "friend-id-2",
          firstName: "Bob",
          lastName: "Smith",
          email: "bob.smith@example.com",
          age: 35,
        },
      ];

      jest
        .spyOn(userFriendsService, "findAll")
        .mockResolvedValue(friends as any);

      const mockRequest = { user: { sub: userId } } as any;
      const result = await controller.getAllFriends(mockRequest);

      expect(result).toEqual(friends);
      expect(userFriendsService.findAll).toHaveBeenCalledWith(userId);
    });
  });
});
