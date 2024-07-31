import { EntityManager, NotFoundError } from "@mikro-orm/core";
import { NotAcceptableException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import {
  FriendRequestEntity,
  FriendRequestStatus,
} from "../friend-requests/entities/friend-request.entity";
import { UserFriendsService } from "../user-friends/user-friends.service";
import { UserEntity } from "../users/entities/user.entity";
import { FriendRequestsService } from "./friend-requests.service";

describe("FriendRequestsService", () => {
  let friendRequestsService: FriendRequestsService;

  const mockEm = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    persistAndFlush: jest.fn(),
    nativeUpdate: jest.fn(),
  };

  const mockUserFriendsService = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendRequestsService,
        { provide: EntityManager, useValue: mockEm },
        { provide: UserFriendsService, useValue: mockUserFriendsService },
      ],
    }).compile();

    friendRequestsService = module.get<FriendRequestsService>(
      FriendRequestsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("sendFriendRequest", () => {
    it("should throw NotAcceptableException if senderId equals receiverId", async () => {
      await expect(
        friendRequestsService.sendFriendRequest("1", "1"),
      ).rejects.toThrow(
        new NotAcceptableException("You can't send friend request to yourself"),
      );
    });

    it("should throw NotFoundError if sender or receiver is not found", async () => {
      mockEm.findOne.mockImplementationOnce(() => null);
      await expect(
        friendRequestsService.sendFriendRequest("1", "2"),
      ).rejects.toThrow(new NotFoundError("Sender or receiver not found"));

      mockEm.findOne.mockImplementationOnce(() =>
        Promise.resolve(new UserEntity()),
      );
      mockEm.findOne.mockImplementationOnce(() => null);
      await expect(
        friendRequestsService.sendFriendRequest("1", "2"),
      ).rejects.toThrow(new NotFoundError("Sender or receiver not found"));
    });

    it("should throw NotAcceptableException if users are already friends", async () => {
      mockEm.findOne.mockResolvedValue(new UserEntity());
      mockUserFriendsService.findAll.mockResolvedValue([new UserEntity()]);

      await expect(
        friendRequestsService.sendFriendRequest("1", "2"),
      ).rejects.toThrow(
        new NotAcceptableException("You are already friends with this user"),
      );
    });

    it("should throw NotAcceptableException if a pending request already exists", async () => {
      mockEm.findOne.mockResolvedValue(new UserEntity());
      mockUserFriendsService.findAll.mockResolvedValue([]);
      mockEm.findOne.mockResolvedValue({ status: FriendRequestStatus.PENDING });

      await expect(
        friendRequestsService.sendFriendRequest("1", "2"),
      ).rejects.toThrow(
        new NotAcceptableException("Pending friend request already exists"),
      );
    });

    it("should create a new friend request if none exists", async () => {
      const sender = new UserEntity();
      const receiver = new UserEntity();
      const newRequest = new FriendRequestEntity();
      mockEm.findOne.mockResolvedValueOnce(sender);
      mockEm.findOne.mockResolvedValueOnce(receiver);
      mockUserFriendsService.findAll.mockResolvedValue([]);
      mockEm.findOne.mockResolvedValue(null);
      mockEm.create.mockReturnValue(newRequest);

      const result = await friendRequestsService.sendFriendRequest("1", "2");

      expect(result).toBe(newRequest);
      expect(mockEm.persistAndFlush).toHaveBeenCalledWith(newRequest);
    });
  });

  describe("getFriendRequests", () => {
    it("should return an array of pending friend requests", async () => {
      const user = new UserEntity();
      const request = new FriendRequestEntity();
      mockEm.findOne.mockResolvedValue(user);
      mockEm.find.mockResolvedValue([request]);

      const result = await friendRequestsService.getFriendRequests("1");

      expect(result).toEqual([request]);
      expect(mockEm.find).toHaveBeenCalledWith(
        FriendRequestEntity,
        { receiver: user, status: FriendRequestStatus.PENDING },
        {
          populate: ["sender"],
          fields: [
            "sender.id",
            "sender.firstName",
            "sender.lastName",
            "sender.email",
            "sender.age",
          ],
        },
      );
    });
  });

  describe("acceptFriendRequest", () => {
    it("should throw NotFoundError if friend request is not found", async () => {
      mockEm.findOne.mockResolvedValue(null);

      await expect(
        friendRequestsService.acceptFriendRequest("1", "1"),
      ).rejects.toThrow(new NotFoundError("Friend request not found"));
    });

    it("should create a user friend relationship and update the friend request status", async () => {
      const friendRequest = new FriendRequestEntity();
      friendRequest.sender = { id: "2" } as UserEntity;
      mockEm.findOne.mockResolvedValue(friendRequest);
      mockUserFriendsService.create.mockResolvedValue({});

      const result = await friendRequestsService.acceptFriendRequest("1", "1");

      expect(result).toEqual({ message: "accepted" });
      expect(mockUserFriendsService.create).toHaveBeenCalledWith({
        user1Id: "1",
        user2Id: "2",
      });
      expect(mockEm.nativeUpdate).toHaveBeenCalledWith(
        FriendRequestEntity,
        { id: "1" },
        { status: FriendRequestStatus.ACCEPTED },
      );
    });
  });

  describe("declineFriendRequest", () => {
    it("should throw NotFoundError if friend request is not found or not pending", async () => {
      mockEm.findOne.mockResolvedValue(null);
      await expect(
        friendRequestsService.declineFriendRequest("1", "1"),
      ).rejects.toThrow(new NotFoundError("Friend request not found"));

      mockEm.findOne.mockResolvedValue({
        status: FriendRequestStatus.ACCEPTED,
      });
      await expect(
        friendRequestsService.declineFriendRequest("1", "1"),
      ).rejects.toThrow(new NotFoundError("Friend request not found"));
    });

    it("should update the friend request status to declined", async () => {
      const friendRequest = new FriendRequestEntity();
      mockEm.findOne.mockResolvedValue(friendRequest);

      const result = await friendRequestsService.declineFriendRequest("1", "1");

      expect(result).toEqual({ message: "declined" });
      expect(mockEm.nativeUpdate).toHaveBeenCalledWith(
        FriendRequestEntity,
        { id: "1" },
        { status: FriendRequestStatus.DECLINED },
      );
    });
  });
});
