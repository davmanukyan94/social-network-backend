import { NotFoundError } from "@mikro-orm/core";
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { FastifyReply } from "fastify";

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private logger: Logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    try {
      this.logger.log(`[ ERROR ] ${exception}`);
      this.logger.log(
        `[ ERROR Details ] ${exception.message} ${exception.code}`,
      );

      const context = host.switchToHttp();
      const response = context.getResponse<FastifyReply>();
      let status: HttpStatus;
      let message = exception.message;
      const code = exception.code;

      switch (exception.constructor) {
        case HttpException:
          status = exception.getStatus();
          break;
        case NotAcceptableException:
          status = HttpStatus.NOT_ACCEPTABLE;
          break;
        case NotFoundException:
          status = HttpStatus.NOT_FOUND;
          message = exception.response.message;
          break;
        case NotFoundError:
          status = HttpStatus.UNPROCESSABLE_ENTITY;
          break;
        case UnauthorizedException:
          status = HttpStatus.UNAUTHORIZED;
          break;
        case BadRequestException:
          status = HttpStatus.BAD_REQUEST;
          message = exception.response.message;
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
      }

      if (response.status instanceof Function) {
        response.status(status).send({ message, code });
      }
    } catch (error) {
      this.logger.log(`[ ERROR All ] ${error}`);
    } finally {
      super.catch(exception, host);
    }
  }
}
