import { plainToInstance } from 'class-transformer'
import { IsEnum, IsInt, IsString, Max, Min, validateSync } from 'class-validator'

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development

  @IsInt()
  @Min(0)
  @Max(65535)
  PORT: number = 3000

  @IsString()
  DB_HOST: string

  @IsInt()
  @Min(0)
  @Max(65535)
  DB_PORT: number

  @IsString()
  DB_USER: string

  @IsString()
  DB_PASSWORD: string

  @IsString()
  DB_NAME: string

  @IsString()
  LOG_LEVEL: string = 'info'

  @IsString()
  SERVICE_NAME: string = 'LEDGER'
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })

  const errors = validateSync(validated, { skipMissingProperties: false })

  if (errors.length > 0) {
    const details = errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('\n  ')
    throw new Error(`Invalid environment variables:\n  ${details}`)
  }

  return validated
}
