// application/accounting/accounts/activate-account.usecase.ts
import { Inject, Injectable } from '@nestjs/common'

import { EntityId } from '@domain/vo/entity-id.vo'
import { Account } from '@domain/account.entity'
import { AccountRepository } from '@domain/repositories/account.repository'
import { DomainNotFoundError } from '@domain/errors/domain.error'

import { ACCOUNT_REPOSITORY, LOGGER } from '@shared/tokens'
import { Logger } from '@shared/logger/logger.interface'

@Injectable()
export class ActivateAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly repoAccount: AccountRepository,

    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(accountId: string): Promise<Account> {
    const account = await this.repoAccount.findById(EntityId.from(accountId))
    if (!account) throw new DomainNotFoundError('Account not found', accountId)

    account.activate()
    await this.repoAccount.save(account)

    this.logger.info('Account activated', {
      accountId: account.id.value,
      ownerId: account.ownerId,
    })

    return account
  }
}
