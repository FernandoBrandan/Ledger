// application/accounting/accounts/open-account.usecase.ts
import { Inject, Injectable } from '@nestjs/common'

import { Account } from '@domain/account.entity'
import { EntityId } from '@domain/vo/entity-id.vo'
import { Currency } from '@domain/vo/currency.vo'
import { DomainNotFoundError } from '@domain/errors/domain.error'
import { AccountRepository } from '@domain/repositories/account.repository'

import { CreateAccountDto } from '../dto/request/create-account.request.dto'

import { ACCOUNT_REPOSITORY, LOGGER } from '@shared/tokens'

import { Logger } from '@shared/logger/logger.interface'

@Injectable()
export class CreateAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly repoAccount: AccountRepository,

    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(dto: CreateAccountDto): Promise<Account> {
    if (dto.parentAccountId) {
      const parent = await this.repoAccount.findById(EntityId.from(dto.parentAccountId))
      if (!parent) throw new DomainNotFoundError('Account', dto.parentAccountId)
      if (!parent.canOperate()) throw new Error('Parent can´t operate: ' + dto.parentAccountId)
    }
    const account = Account.create({
      id: EntityId.create(),
      ownerId: dto.ownerId,
      type: dto.type,
      currency: Currency.from(dto.currencyCode),
      parentAccountId: dto.parentAccountId ? EntityId.from(dto.parentAccountId) : undefined,
    })

    await this.repoAccount.save(account)

    this.logger.info('Account created', {
      accountId: account.id.value,
      ownerId: account.ownerId,
      type: account.type,
      currency: account.currency.code,
      parentAccountId: account.parentAccountId?.value,
    })

    return account
  }
}
