import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { Logger } from '@shared/logger/logger.interface'
import { LOGGER } from '@shared/tokens'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(@Inject(LOGGER) private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request & { correlationId?: string }>()
    const response = ctx.getResponse<Response>()

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined

    let message: string | string[] = 'Internal server error'

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse
    } else if (exceptionResponse && typeof exceptionResponse === 'object') {
      message = (exceptionResponse as any).message ?? message
    } else if (exception instanceof Error) {
      message = exception.message
    }

    const logMeta = {
      path: request.url,
      method: request.method,
      status,
      correlationId: request.correlationId,
      message,
    }

    if (status >= 500) {
      this.logger.error('Unhandled exception', {
        ...logMeta,
        stack: exception instanceof Error ? exception.stack : undefined,
      })
    } else if (status >= 400) {
      this.logger.warn('Client exception', logMeta)
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId: request.correlationId,
    })
  }
}
