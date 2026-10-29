// application/transaction/services/posting.service.ts
import { Inject, Injectable } from '@nestjs/common'

import { Transaction } from '@domain/transaction.entity'
import { EntityId } from '@domain/vo/entity-id.vo'
import { Account } from '@domain/account.entity'
import { AccountRepository } from '@domain/repositories/account.repository'
import { TransactionRepository } from '@domain/repositories/transaction.repository'
import { TRANSACTION_REPOSITORY, ACCOUNT_REPOSITORY, LOGGER } from '@shared/tokens'
import { Logger } from '@shared/logger/logger.interface'
import { DomainNotFoundError } from '@domain/errors/domain.error'

// interface UnitOfWork {
//   run<T>(fn: () => Promise<T>): Promise<T>
// }

@Injectable()
export class PostingService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly repoTransactions: TransactionRepository,

    @Inject(ACCOUNT_REPOSITORY)
    private readonly repoAccounts: AccountRepository,

    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async post(tx: Transaction): Promise<Transaction> {
    tx.post()

    const uniqueIds = [...new Set(tx.entries.map((e) => e.accountId.value))]
    const accounts = new Map<string, Account>()
    for (const id of uniqueIds) {
      const acc = await this.repoAccounts.findById(EntityId.from(id))
      if (!acc) {
        this.logger.error('Account not found while posting', { txId: tx.id.value, accountId: id })
        throw new DomainNotFoundError('Account', id)
      }
      accounts.set(id, acc)
    }

    for (const entry of tx.entries) {
      const acc = accounts.get(entry.accountId.value)!
      if (entry.isDebit()) acc.applyDebit(entry.amount)
      else acc.applyCredit(entry.amount)
    }

    // await this.uow.run(async () => {
    await this.repoTransactions.save(tx)
    for (const acc of accounts.values()) await this.repoAccounts.save(acc)
    // })

    this.logger.info('Transaction posted', {
      transactionId: tx.id.value,
      reference: tx.reference,
      entryCount: tx.entries.length,
      affectedAccounts: [...accounts.keys()],
      postedAt: tx.postedAt?.toISOString(),
    })
    return tx
  }
}
