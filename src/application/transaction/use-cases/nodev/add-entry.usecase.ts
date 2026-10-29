// application/accounting/transactions/add-entry.usecase.ts

import { Inject, Injectable } from '@nestjs/common'
import { EntryDirection } from '../../../../domain/enums'
import { Transaction } from '../../../../domain/transaction.entity'

export interface AddEntryInput {
  transactionId: string
  accountId: string
  direction: EntryDirection
  amount: string
  currencyCode: string
}

// ### 3️⃣ `AddEntryUseCase` — ❓ decisión

// Está vacío. Acá la pregunta es:
// **¿tu UX arma la transacción de una sola vez o paso a paso?**

// * **De una sola vez** (una pantalla, todos los asientos):
// `CreateTransaction` ya recibe `entries[]`.
// **`AddEntry` no hace falta.** Borralo o dejalo comentado.

// * **Paso a paso** (crear DRAFT vacío → agregar asiento → agregar asiento → postear): necesitás `AddEntry`.

// Para el MVP te recomiendo **NO implementarlo** y comentar en `transactions.md`
// que queda para después. Menos superficie = menos bugs.

@Injectable()
export class AddEntryUseCase {
  constructor(
    // @Inject(TRANSACTION_REPOSITORY) private readonly txRepo: TransactionRepository,
    // @Inject(ACCOUNT_REPOSITORY) private readonly accRepo: AccountRepository,
  ) {}

  async execute(input: AddEntryInput): Promise<Transaction> {
    // const tx = await this.txRepo.findById(TransactionId.from(input.transactionId))
    // if (!tx) throw new NotFoundError('Transaction', input.transactionId)
    // const account = await this.accRepo.findById(AccountId.from(input.accountId))
    // if (!account) throw new NotFoundError('Account', input.accountId)
    // const money = Money.of(input.amount, Currency.from(input.currencyCode))
    // if (input.direction === EntryDirection.DEBIT) {
    //   tx.addDebit({ accountId: account.id, amount: money })
    // } else {
    //   tx.addCredit({ accountId: account.id, amount: money })
    // }
    // await this.txRepo.save(tx)
    // return tx

    return {} as Transaction
  }
}

// add - entry solo tiene sentido si vas a construir la transacción en varios pasos(create DRAFT vacía → varios add - entry → post).
// Si en tu UX la transacción se arma de una sola vez(una pantalla, todos los asientos),
// create - transaction ya recibe entries[] y add - entry sobra.Miralo cuando armes el primer flujo real y decidís.

// import { EntityId } from '../../../domain/vo/entity-id.vo'
// import { Money } from '../../../domain/vo/money.vo'
// import { Currency } from '../../../domain/vo/currency.vo'
// import { EntryDirection } from '../../../domain/enums'
// import { TransactionRepository } from '../../ports/transaction.repository'
// import { AddEntryRequestDto } from '../dto/request/add-entry.request.dto'
// import {
//   TransactionResponseDto,
//   toTransactionResponse,
// } from '../dto/response/transaction.response.dto'

// export class AddEntryUseCase {
//   constructor(
//     private readonly transactions: TransactionRepository,
//     private readonly newId: () => EntityId,
//   ) {}

//   async execute(input: AddEntryRequestDto): Promise<TransactionResponseDto> {
//     const tx = await this.transactions.findById(new EntityId(input.transactionId))
//     if (!tx) throw new Error(`Transacción ${input.transactionId} no encontrada`)

//     const props = {
//       id: this.newId(),
//       accountId: new EntityId(input.accountId),
//       amount: Money.of(input.amount, Currency.of(input.currency)),
//     }

//     if (input.direction === EntryDirection.DEBIT) tx.addDebit(props)
//     else tx.addCredit(props)

//     await this.transactions.save(tx)
//     return toTransactionResponse(tx)
//   }
// }
