// application/accounting/transactions/get-transaction.usecase.ts
import { Inject, Injectable } from '@nestjs/common'
import { EntityId } from '@domain/vo/entity-id.vo'
import { TransactionRepository } from '@domain/repositories/transaction.repository'
import { Transaction } from '@domain/transaction.entity'
import { TRANSACTION_REPOSITORY } from '@shared/tokens'
import { DomainNotFoundError } from '@domain/errors/domain.error'

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly repoTransactions: TransactionRepository,
  ) {}

  async execute(transactionId: string): Promise<Transaction> {
    const tx = await this.repoTransactions.findById(EntityId.from(transactionId))
    if (!tx) throw new DomainNotFoundError('Transaction', transactionId)
    return tx
  }
}
