import { BaseRepository } from "../database/base.repository";
import { UserEntity } from "./entities/user.entity";

export class UsersRepository extends BaseRepository<UserEntity> {}
