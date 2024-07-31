import { NotAcceptableException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthGuard } from "../auth/auth.guard";
import {
  FriendRequestEntity,
  FriendRequestStatus,
} from "../friend-requests/entities/friend-request.entity";
import { FriendRequestsController } from "./friend-requests.controller";
import { FriendRequestsService } from "./friend-requests.service";

describe("FriendRequestsController", () => {
  let controller: FriendRequestsController;
  let service: FriendRequestsService;

  const mockFriendRequestsService = {
    sendFriendRequest: jest.fn(),
    getFriendRequests: jest.fn(),
    acceptFriendRequest: jest.fn(),
    declineFriendRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendRequestsController],
      providers: [
        { provide: FriendRequestsService, useValue: mockFriendRequestsService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<FriendRequestsController>(FriendRequestsController);
    service = module.get<FriendRequestsService>(FriendRequestsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("sendFriendRequest", () => {
    it("should send a friend request", async () => {
      const userId = "1";
      const receiverId = "2";

      const mockFriendRequest: FriendRequestEntity = {
        id: "request-id",
        sender: {
          id: userId,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          password: "hashed-password",
          age: 30,
        } as any,
        receiver: {
          id: receiverId,
          firstName: "Jane",
          lastName: "Doe",
          email: "jane.doe@example.com",
          password: "hashed-password",
          age: 28,
        } as any,
        status: FriendRequestStatus.PENDING,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      jest
        .spyOn(service, "sendFriendRequest")
        .mockResolvedValue(mockFriendRequest);

      const response = await controller.sendFriendRequest(
        { user: { sub: userId } },
        { receiverId },
      );

      expect(response).toEqual(mockFriendRequest);
      expect(service.sendFriendRequest).toHaveBeenCalledWith(
        userId,
        receiverId,
      );
    });

    it("should throw NotAcceptableException if sending to self", async () => {
      const userId = "1";
      const receiverId = "1";

      jest
        .spyOn(service, "sendFriendRequest")
        .mockRejectedValue(
          new NotAcceptableException(
            "You can't send friend request to yourself",
          ),
        );

      await expect(
        controller.sendFriendRequest({ user: { sub: userId } }, { receiverId }),
      ).rejects.toThrow(NotAcceptableException);
    });
  });

  describe("getFriendRequests", () => {
    it("should return friend requests for the user", async () => {
      const userId = "1";
      const friendRequests: FriendRequestEntity[] = [
        {
          id: "request-id",
          sender: {
            id: "2",
            firstName: "Jane",
            lastName: "Doe",
            email: "jane.doe@example.com",
            password: "hashed-password",
            age: 28,
          } as any,
          receiver: {
            id: userId,
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            password: "hashed-password",
            age: 30,
          } as any,
          status: FriendRequestStatus.PENDING,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      jest
        .spyOn(service, "getFriendRequests")
        .mockResolvedValue(friendRequests);

      const response = await controller.getFriendRequests({
        user: { sub: userId },
      });

      expect(response).toEqual(friendRequests);
      expect(service.getFriendRequests).toHaveBeenCalledWith(userId);
    });
  });

  describe("acceptFriendRequest", () => {
    it("should accept a friend request", async () => {
      const userId = "1";
      const requestId = "request-id";

      jest
        .spyOn(service, "acceptFriendRequest")
        .mockResolvedValue({ message: "Friend request accepted" });

      const response = await controller.acceptFriendRequest(
        { user: { sub: userId } },
        requestId,
      );

      expect(response).toEqual({ message: "Friend request accepted" });
      expect(service.acceptFriendRequest).toHaveBeenCalledWith(
        userId,
        requestId,
      );
    });

    it("should throw NotFoundException if request is not found", async () => {
      const userId = "1";
      const requestId = "invalid-request-id";

      jest
        .spyOn(service, "acceptFriendRequest")
        .mockRejectedValue(new NotFoundException("Friend request not found"));

      await expect(
        controller.acceptFriendRequest({ user: { sub: userId } }, requestId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("declineFriendRequest", () => {
    it("should decline a friend request", async () => {
      const userId = "1";
      const requestId = "request-id";

      jest
        .spyOn(service, "declineFriendRequest")
        .mockResolvedValue({ message: "Friend request declined" });

      const response = await controller.declineFriendRequest(
        { user: { sub: userId } },
        requestId,
      );

      expect(response).toEqual({ message: "Friend request declined" });
      expect(service.declineFriendRequest).toHaveBeenCalledWith(
        requestId,
        userId,
      );
    });

    it("should throw NotFoundException if request is not found", async () => {
      const userId = "1";
      const requestId = "invalid-request-id";

      jest
        .spyOn(service, "declineFriendRequest")
        .mockRejectedValue(new NotFoundException("Friend request not found"));

      await expect(
        controller.declineFriendRequest({ user: { sub: userId } }, requestId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
