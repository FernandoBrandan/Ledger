import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Inject } from '@nestjs/common'
import { Request, Response } from 'express'
import {
  DomainConflictError,
  DomainError,
  DomainNotFoundError,
  DomainRuleError,
  DomainValidationError,
} from '@domain/errors/domain.error'
import { LOGGER } from '@shared/tokens'
import { Logger } from '@shared/logger/logger.interface'

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  constructor(@Inject(LOGGER) private readonly logger: Logger) {}

  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request & { correlationId?: string }>()
    const response = ctx.getResponse<Response>()

    const status = this.statusFor(exception)

    if (status >= 500) {
      this.logger.error('Domain error', {
        code: exception.code,
        path: request.url,
        correlationId: request.correlationId,
        stack: exception.stack,
      })
    } else if (status >= 400) {
      this.logger.warn('Domain error', {
        code: exception.code,
        message: exception.message,
        path: request.url,
        correlationId: request.correlationId,
      })
    }

    response.status(status).json({
      statusCode: status,
      code: exception.code,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId: request.correlationId,
    })
  }

  private statusFor(error: DomainError): number {
    if (error instanceof DomainNotFoundError) return HttpStatus.NOT_FOUND
    if (error instanceof DomainValidationError) return HttpStatus.BAD_REQUEST
    if (error instanceof DomainConflictError) return HttpStatus.CONFLICT
    if (error instanceof DomainRuleError) return HttpStatus.UNPROCESSABLE_ENTITY
    return HttpStatus.INTERNAL_SERVER_ERROR
  }
}
