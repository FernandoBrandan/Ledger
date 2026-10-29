// application/accounting/transactions/post-transaction.usecase.ts
import { Inject, Injectable } from '@nestjs/common'

import { EntityId } from '@domain/vo/entity-id.vo'
import { Transaction } from '@domain/transaction.entity'
import { DomainNotFoundError } from '@domain/errors/domain.error'
import { TransactionRepository } from '@domain/repositories/transaction.repository'

import { PostingService } from '../services/posting.service'

import { TRANSACTION_REPOSITORY } from '@shared/tokens'

@Injectable()
export class PostTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly repoTransactions: TransactionRepository,

    private readonly servicePost: PostingService,
  ) {}

  async execute(transactionId: string): Promise<Transaction> {
    const tx = await this.repoTransactions.findById(EntityId.from(transactionId))
    if (!tx) throw new DomainNotFoundError('Transaction', transactionId)

    return this.servicePost.post(tx)
  }
}
