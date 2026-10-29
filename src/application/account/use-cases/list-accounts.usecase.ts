// application/accounting/accounts/list-accounts.usecase.ts
import { Inject, Injectable } from '@nestjs/common'

import { AccountType } from '@domain/enums'
import { AccountRepository } from '@domain/repositories/account.repository'
import { ACCOUNT_REPOSITORY } from '@shared/tokens'

@Injectable()
export class ListAccountsUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly repoAccount: AccountRepository,
  ) {}

  execute(type?: AccountType) {
    return type ? this.repoAccount.findByType(type) : this.repoAccount.getAll()
  }
}
