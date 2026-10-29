// application/accounting/accounts/get-account.usecase.ts
import { Inject, Injectable } from '@nestjs/common'

import { Account } from '@domain/account.entity'
import { AccountRepository } from '@domain/repositories/account.repository'
import { EntityId } from '@domain/vo/entity-id.vo'
import { ACCOUNT_REPOSITORY } from '@shared/tokens'

@Injectable()
export class GetAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly repoAccount: AccountRepository,
  ) {}

  async execute(id: string): Promise<Account | null> {
    return this.repoAccount.findById(EntityId.from(id))
  }
}
