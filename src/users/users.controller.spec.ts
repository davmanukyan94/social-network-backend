import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { AuthGuard } from "../auth/auth.guard";
import { UserEntity } from "./entities/user.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

class MockAuthGuard {
  canActivate(context: any) {
    const request = context.switchToHttp().getRequest();
    request.user = { sub: "1" };
    return true;
  }
}

describe("UsersController", () => {
  let app: INestApplication;
  let service: UsersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getOneOrFail: jest.fn(),
            search: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();
    service = module.get<UsersService>(UsersService);
  });

  it("should return user profile", async () => {
    const user = new UserEntity();
    service.getOneOrFail = jest.fn().mockResolvedValue(user);

    return request(app.getHttpServer())
      .get("/client/me")
      .set("Authorization", "Bearer token")
      .expect(200)
      .expect(user);
  });

  it("should search for users", async () => {
    const user = new UserEntity();
    service.search = jest.fn().mockResolvedValue({
      items: [user],
      total: 1,
      page: 1,
      pageCount: 1,
    });

    return request(app.getHttpServer())
      .get("/client/search")
      .query({ email: "test" })
      .set("Authorization", "Bearer token")
      .expect(200)
      .expect({
        items: [user],
        total: 1,
        page: 1,
        pageCount: 1,
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
