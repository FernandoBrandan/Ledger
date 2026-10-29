import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { createObserveModule } from '@nestjs/observe'

import { AccountsController } from './presentation/accounts.controller'
import { TransactionsController } from './presentation/transactions.controller'
import { TransfersController } from './presentation/transfers.controller'

import { CreateAccountUseCase } from './application/account/use-cases/create-account.usecase'
import { GetAccountUseCase } from './application/account/use-cases/get-account.usecase'
import { ListAccountsUseCase } from './application/account/use-cases/list-accounts.usecase'
import { ActivateAccountUseCase } from './application/account/use-cases/activate-account.usecase'

import { CreateTransactionUseCase } from './application/transaction/use-cases/create-transaction.usecase'
import { GetTransactionUseCase } from './application/transaction/use-cases/get-transaction.usecase'
import { PostTransactionUseCase } from './application/transaction/use-cases/post-transaction.usecase'
import { TransferUseCase } from './application/transaction/use-cases/transfer.usecase'
import { PostingService } from './application/transaction/services/posting.service'

import { TypeOrmAccountRepository } from './infrastructure/account/repositories/typeorm-account.repository'
import { TypeOrmTransactionRepository } from './infrastructure/transaction/repositories/typeorm-transaction.repository'

import { AccountEntity } from './infrastructure/account/persistence/account.orm-entity'
import { TransactionEntity } from './infrastructure/transaction/persistence/transaction.orm-entity'
import { EntryEntity } from './infrastructure/transaction/persistence/entry.orm-entity'

import { ACCOUNT_REPOSITORY, TRANSACTION_REPOSITORY } from './shared/tokens'
import { HealthModule } from './shared/health/health.module'
import { LoggerModule } from './shared/logger/logger.module'
import { validateEnv } from './shared/config/env.validation'
import configuration from './shared/config/configuration'

export const { ObserveModule, ObserveInstrument } = createObserveModule()

@Module({
  imports: [
    // -corDistributed tracing, autorelated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    // ObserveModule.forRoot({
    //   appKey: 'YOUR_APP_KEY',
    //   appSecret: 'YOUR_APP_SECRET',
    //   serviceId: 'pr_ledger',
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const env = config.get<string>('env')!
        return {
          type: 'postgres',
          host: config.get<string>('database.host')!,
          port: config.get<number>('database.port')!,
          username: config.get<string>('database.username')!,
          password: config.get<string>('database.password')!,
          database: config.get<string>('database.name')!,
          entities: [AccountEntity, TransactionEntity, EntryEntity],
          synchronize: env !== 'production',
          logging: env === 'development' ? ['error', 'warn'] : ['error'],
        }
      },
    }),
    TypeOrmModule.forFeature([AccountEntity, TransactionEntity, EntryEntity]),
    HealthModule,
    LoggerModule,
  ],
  controllers: [AccountsController, TransactionsController, TransfersController],
  providers: [
    CreateAccountUseCase,
    GetAccountUseCase,
    ListAccountsUseCase,
    ActivateAccountUseCase,

    CreateTransactionUseCase,
    GetTransactionUseCase,
    PostTransactionUseCase,
    TransferUseCase,
    PostingService,

    {
      provide: ACCOUNT_REPOSITORY,
      useClass: TypeOrmAccountRepository,
    },
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TypeOrmTransactionRepository,
    },
  ],
  exports: [ACCOUNT_REPOSITORY, TRANSACTION_REPOSITORY],
})
export class AppModule {}
