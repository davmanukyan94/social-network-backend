import { EntityManager } from "@mikro-orm/postgresql";
import { Test, TestingModule } from "@nestjs/testing";
import { UserEntity } from "./entities/user.entity";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let service: UsersService;
  let em: EntityManager;
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: EntityManager,
          useValue: {
            persistAndFlush: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            create: jest.fn(),
            findOneOrFail: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    em = module.get<EntityManager>(EntityManager);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create a user", async () => {
    const dto = {
      firstName: "test",
      lastName: "test",
      age: 11,
      email: "test@example.com",
      password: "password",
    };
    const user = new UserEntity();
    repository.create = jest.fn().mockReturnValue(user);

    await service.create(dto);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(em.persistAndFlush).toHaveBeenCalledWith(user);
  });

  it("should find a user by id", async () => {
    const user = new UserEntity();
    repository.findOneOrFail = jest.fn().mockResolvedValue(user);

    const result = await service.getOneOrFail("1");

    expect(repository.findOneOrFail).toHaveBeenCalledWith({ id: "1" });
    expect(result).toEqual(user);
  });

  it("should find a user by email", async () => {
    const user = new UserEntity();
    repository.findOne = jest.fn().mockResolvedValue(user);

    const result = await service.getOneByEmail("test@example.com");

    expect(repository.findOne).toHaveBeenCalledWith({
      email: "test@example.com",
    });
    expect(result).toEqual(user);
  });

  it("should search users", async () => {
    const user = new UserEntity();
    em.findAndCount = jest.fn().mockResolvedValue([[user], 1]);

    const result = await service.search({
      page: 1,
      limit: 10,
      firstName: "test",
    });

    expect(em.findAndCount).toHaveBeenCalled();
    expect(result.items).toEqual([user]);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageCount).toBe(1);
  });
});
