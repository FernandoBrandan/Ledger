import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { HttpModule } from '@nestjs/axios'
import { HealthController } from './health.controller'

@Module({
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: 'pretty', // o 'json' en producción
      gracefulShutdownTimeoutMs: 1000,
    }),
    HttpModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
