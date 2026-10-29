// pr_ledger/src/domain/transaction.entity.ts
import { Money } from './vo/money.vo'
import { EntityId } from './vo/entity-id.vo'
import { Entry, CreateEntryProps } from './entry.entity'
import { TransactionStatus, EntryDirection } from './enums/index'
import {
  MissingReferenceError,
  NotEnoughEntriesError,
  TransactionNotBalancedError,
  TransactionNotEditableError,
  TransactionNotPostedError,
} from './errors/transaction.errors'

export interface ITransaction {
  readonly id: EntityId
  readonly reference: string
  readonly status: TransactionStatus
  readonly occurredAt: Date
  readonly createdAt: Date
  readonly postedAt?: Date
  readonly entries: readonly Entry[]

  addDebit(props: CreateEntryProps): Entry
  addCredit(props: CreateEntryProps): Entry
  post(at?: Date): void
  reverse(reason: string): Transaction
}

interface CreateTransactionProps {
  id: EntityId
  reference: string
  occurredAt?: Date
  createdAt?: Date
}

export class Transaction implements ITransaction {
  private _entries: Entry[] = []

  private constructor(
    public readonly id: EntityId,
    public readonly reference: string,
    private _status: TransactionStatus,
    public readonly occurredAt: Date,
    public readonly createdAt: Date,
    private _postedAt?: Date,
  ) {
    if (!reference?.trim()) throw new MissingReferenceError()
  }

  static create(props: CreateTransactionProps): Transaction {
    return new Transaction(
      props.id,
      props.reference,
      TransactionStatus.DRAFT,
      props.occurredAt ?? new Date(),
      props.createdAt ?? new Date(),
    )
  }

  static reconstitute(
    id: string,
    reference: string,
    status: TransactionStatus,
    occurredAt: Date,
    createdAt: Date,
    postedAt: Date | null | undefined,
    entries: Entry[],
  ): Transaction {
    const transaction = new Transaction(
      EntityId.from(id),
      reference,
      status,
      occurredAt,
      createdAt,
      postedAt ?? undefined,
    )
    transaction._entries = entries
    return transaction
  }

  get status(): TransactionStatus {
    return this._status
  }

  get postedAt(): Date | undefined {
    return this._postedAt
  }

  get entries(): readonly Entry[] {
    return this._entries
  }

  //  Registra un débito sobre una cuenta.
  //  El aggregate se encarga de vincular el asiento a esta transacción.
  addDebit(props: CreateEntryProps): Entry {
    this.assertEditable()
    const entry = Entry.debit(props)
    this.assertCurrency(entry)
    entry.linkTo(this.id)
    this._entries.push(entry)
    return entry
  }

  addCredit(props: CreateEntryProps): Entry {
    this.assertEditable()
    const entry = Entry.credit(props)
    this.assertCurrency(entry)
    entry.linkTo(this.id)
    this._entries.push(entry)
    return entry
  }

  post(at: Date = new Date()): void {
    this.assertEditable()
    this.assertMinimumEntries()
    this.assertBalanced()

    this._status = TransactionStatus.POSTED
    this._postedAt = at
  }

  reverse(reason: string): Transaction {
    if (this._status !== TransactionStatus.POSTED) throw new TransactionNotPostedError()

    const reversal = Transaction.create({
      id: EntityId.create(),
      reference: `REV-${this.reference}`,
      occurredAt: new Date(),
    })

    for (const entry of this._entries) {
      const props = {
        id: EntityId.create(),
        accountId: entry.accountId,
        amount: entry.amount,
      }
      if (entry.isDebit()) reversal.addCredit(props)
      else reversal.addDebit(props)
    }

    reversal.post()
    this._status = TransactionStatus.REVERSED

    return reversal
  }

  private assertEditable(): void {
    if (this._status !== TransactionStatus.DRAFT) throw new TransactionNotEditableError()
  }

  private assertMinimumEntries(): void {
    if (this._entries.length < 2) throw new NotEnoughEntriesError()
  }

  //  Partida doble: suma de débitos === suma de créditos.
  //  Todos los asientos deben estar en la misma moneda.
  private assertBalanced(): void {
    const currency = this._entries[0]!.amount.currency
    let debit = Money.zero(currency)
    let credit = Money.zero(currency)

    for (const e of this._entries) {
      if (e.isDebit()) debit = debit.add(e.amount)
      else credit = credit.add(e.amount)
    }

    if (!debit.equals(credit)) throw new TransactionNotBalancedError(debit, credit)
  }

  private assertCurrency(entry: Entry): void {
    const first = this._entries[0]
    if (first && !entry.amount.currency.equals(first.amount.currency))
      throw new Error('Todos los asientos deben estar en la misma moneda')
  }
}
