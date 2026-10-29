// application/accounting/accounts/suspend-account.usecase.ts

// import { Inject, Injectable } from '@nestjs/common'
// import { Account } from '../../../../domain/account.entity'
// import {
//   AccountRepository,
//   ACCOUNT_REPOSITORY,
// } from '../../../../domain/repositories/account.repository'
// import { Currency } from '../../../../domain/vo/currency.vo'
// import { AccountType } from '../../../../domain/enums'

// @Injectable()
// export class SuspendAccountUseCase {
//   constructor(@Inject(ACCOUNT_REPOSITORY) private readonly repo: AccountRepository) {}

//   async execute(id: string): Promise<Account> {
//     const account = await this.repo.findById(AccountId.from(id))
//     if (!account) throw new NotFoundError('Account', id)
//     account.suspend()
//     await this.repo.save(account)
//     return account
//   }
// }

// `ReactivateAccountUseCase` y `CloseAccountUseCase` son idénticos cambiando `account.reactivate()` / `account.close()`.

// ### 5️⃣ `SuspendAccountUseCase` / `ReactivateAccountUseCase` / `CloseAccountUseCase`

// Los tres son **idénticos** cambiando una línea:

// ```ts
// async execute(id: string): Promise<Account> {
//   const account = await this.accounts.findById(EntityId.from(id))
//   if (!account) throw new NotFoundError('Account', id)
//   account.suspend()        // ← suspend / reactivate / close
//   await this.accounts.save(account)
//   return account
// }
// ```

// `close()` ya valida en el dominio que balance = 0. No dupliques esa regla en el use case.
