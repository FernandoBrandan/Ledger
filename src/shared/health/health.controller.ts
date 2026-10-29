import { Controller, Get } from '@nestjs/common'
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus'
// import { ApiTags, ApiOperation } from '@nestjs/swagger'

// @ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  // @ApiOperation({ summary: 'Estado general del servicio' })
  check() {
    return this.health.check([
      // Base de datos
      () => this.db.pingCheck('database'),

      // Memoria (máximo 300MB heap, 500MB RSS)
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
    ])
  }

  @Get('liveness')
  @HealthCheck()
  // @ApiOperation({ summary: 'Liveness probe (Kubernetes)' })
  liveness() {
    return this.health.check([]) // solo verifica que el proceso responde
  }

  @Get('readiness')
  @HealthCheck()
  // @ApiOperation({ summary: 'Readiness probe (Kubernetes)' })
  readiness() {
    return this.health.check([() => this.db.pingCheck('database')])
  }

  // @Get('custom')
  // @HealthCheck()
  // customCheck() {
  //   return this.health.check([() => this.custom.isHealthy('custom')])
  // }
}
