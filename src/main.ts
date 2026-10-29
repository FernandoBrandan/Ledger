import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule, ObserveInstrument } from './app.module'

import { AppLogger } from '@shared/logger/logger'
import { correlationIdMiddleware } from '@shared/logger/correlation-id.middleware'
import { AllExceptionsFilter } from '@shared/errors/all-exceptions.filter'
import { InfrastructureExceptionFilter } from '@shared/common/filters/infrastructure-exception.filter'
import { DomainExceptionFilter } from '@domain/errors/domain-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // instrument: ObserveInstrument,
  })

  app.enableShutdownHooks()
  app.use(correlationIdMiddleware)
  app.useGlobalFilters(new InfrastructureExceptionFilter())
  app.useGlobalFilters(new AllExceptionsFilter(new AppLogger()))
  app.useGlobalFilters(new DomainExceptionFilter(new AppLogger()))

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
