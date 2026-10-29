// application/accounting/transactions/create-transaction.usecase.ts
import { Inject, Injectable } from '@nestjs/common'

import { EntryDirection } from '@domain/enums'
import { Money } from '@domain/vo/money.vo'
import { Currency } from '@domain/vo/currency.vo'
import { EntityId } from '@domain/vo/entity-id.vo'

import { Transaction } from '@domain/transaction.entity'
import { CreateTransactionDto } from '../dto/request/create-transaction.request.dto'
import { TransactionRepository } from '@domain/repositories/transaction.repository'

import { LOGGER, TRANSACTION_REPOSITORY } from '@shared/tokens'
import { Logger } from '@shared/logger/logger.interface'

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly repoTransactions: TransactionRepository,

    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<Transaction> {
    const tx = Transaction.create({
      id: EntityId.create(),
      reference: dto.reference,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined,
    })

    for (const line of dto.entries) {
      const props = {
        id: EntityId.create(),
        accountId: EntityId.from(line.accountId),
        amount: Money.of(line.amount, Currency.from(line.currency)),
      }
      if (line.direction === EntryDirection.DEBIT) tx.addDebit(props)
      else tx.addCredit(props)
    }

    await this.repoTransactions.save(tx)

    this.logger.info('Transaction created (DRAFT)', {
      transactionId: tx.id.value,
      reference: tx.reference,
      entryCount: tx.entries.length,
    })

    return tx
  }
}
