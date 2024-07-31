import { FilterQuery } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { SearchResult, SearchUserDto } from "./dto/search-user.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { UserEntity } from "./entities/user.entity";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(
    private readonly em: EntityManager,
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(dto: SignUpDto) {
    const user = this.usersRepository.create(dto);
    await this.em.persistAndFlush(user);
    return user;
  }

  async getOneOrFail(id: string) {
    return this.usersRepository.findOneOrFail({ id });
  }

  async getOneByEmail(email: string) {
    return this.usersRepository.findOne({ email });
  }

  async search(searchParams: SearchUserDto): Promise<SearchResult<UserEntity>> {
    const { page = 1, limit = 10, ...filters } = searchParams;
    const offset = (page - 1) * limit;
    const whereConditions: FilterQuery<UserEntity> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === "string") {
          whereConditions[key] = { $ilike: `%${value}%` };
        } else {
          whereConditions[key] = value;
        }
      }
    });
    const [items, total] = await this.em.findAndCount(
      UserEntity,
      whereConditions,
      {
        limit,
        offset,
        orderBy: { firstName: "ASC", lastName: "ASC" },
      },
    );
    const pageCount = Math.ceil(total / limit);
    return {
      items,
      total,
      page,
      pageCount,
    };
  }
}
