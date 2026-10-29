// pr_ledger/src/domain/account.entity.ts
import { Money } from './vo/money.vo'
import { Currency } from './vo/currency.vo'
import { EntityId } from './vo/entity-id.vo'
import { AccountType, AccountStatus } from './enums/index'
import {
  AccountAlreadyClosedError,
  AccountCurrencyMismatchError,
  AccountNotOperableError,
  AccountWithBalanceError,
  InvalidAccountStateError,
  SelfParentAccountError,
} from './errors/account.errors'


// ============================================================================
// Purpose + OwnerType: los dos ejes del modelo dedicado
// ============================================================================
/**
 * - `personal`  → cuenta del usuario (comprador / pagador)
 * - `business`  → cuenta del comercio (receptor)
 * Para portfolio alcanza con estos dos. `escrow` y `fee_collection`
 * quedan para la etapa 5 del roadmap.
 */
export type AccountPurpose = "personal" | "business";
/**
 * Diferencia la identidad del dueño sin ambigüedad:
 * - `user`     → ownerId = IUserProfile.id (S3)
 * - `merchant` → ownerId = IMerchantProfile.id (S3)
 * Como los ids son strings opacos entre servicios, sin este campo
 * no podrías saber si un `ownerId` es de user o de merchant.
 */
export type AccountOwnerType = "user" | "merchant";

export interface IAccount {
  readonly id: EntityId
  readonly ownerId: string
  readonly type: AccountType
  readonly balance: Money
  readonly currency: Currency
  readonly parentAccountId?: EntityId
  readonly status: AccountStatus
  readonly isActive: boolean
  readonly createdAt: Date
//  readonly updatedAt: Date;
//  readonly activatedAt: Date | null;
//  readonly suspendedAt: Date | null;
//  readonly suspendedReason: string | null;
//  readonly closedAt: Date | null;

  canOperate(): boolean
  activate(): void
  suspend(): void
  reactivate(): void
  close(): void
  applyDebit(amount: Money): void
  applyCredit(amount: Money): void
}

export interface CreateAccountProps {
  id: EntityId
  ownerId: string
  type: AccountType
  currency: Currency
  parentAccountId?: EntityId
  createdAt?: Date
}

export class Account implements IAccount {
  private constructor(
    public readonly id: EntityId,
    public readonly ownerId: string,
    public readonly type: AccountType,
    public readonly currency: Currency,
    public readonly parentAccountId: EntityId | undefined,
    public readonly createdAt: Date,
    private _balance: Money,
    private _status: AccountStatus, 
    // private _updatedAt: Date,
    // private _activatedAt: Date | null,
    // private _suspendedAt: Date | null,
    // private _suspendedReason: string | null,
    // private _closedAt: Date | null,
  ) {
    this.validate()
  }

  static create(props: CreateAccountProps): Account {
    return new Account(
      props.id,
      props.ownerId,
      props.type,
      props.currency,
      props.parentAccountId,
      props.createdAt ?? new Date(),
      Money.zero(props.currency),
      AccountStatus.INACTIVE,
      // now,
      // null, // activatedAt
      // null, // suspendedAt
      // null, // suspendedReason
      // null, // closedAt
    )
  }

  static reconstitute(
    id: string,
    ownerId: string,
    type: AccountType,
    currency: string,
    parentAccountId: string | null | undefined,
    createdAt: Date,
    balance: string,
    status: AccountStatus,
  ): Account {
    const curr = Currency.from(currency)
    return new Account(
      EntityId.from(id),
      ownerId,
      type,
      curr,
      parentAccountId ? EntityId.from(parentAccountId) : undefined,
      createdAt,
      Money.of(balance, curr),
      status,
    )
  }

  get status(): AccountStatus {
    return this._status
  }
  get balance(): Money {
    return this._balance
  }
  get isActive(): boolean {
    return this._status === AccountStatus.ACTIVE
  }

  canOperate(): boolean {
    return this._status === AccountStatus.ACTIVE
  }

  activate(): void {
    if (this._status !== AccountStatus.INACTIVE)
      throw new InvalidAccountStateError('activar', 'INACTIVE', this._status)
    this._status = AccountStatus.ACTIVE
  }

  suspend(): void {
    if (!this.isActive) throw new InvalidAccountStateError('suspender', 'ACTIVE', this._status)
    this._status = AccountStatus.SUSPENDED
  }

  reactivate(): void {
    if (this._status !== AccountStatus.SUSPENDED)
      throw new InvalidAccountStateError('reactivar', 'SUSPENDED', this._status)
    this._status = AccountStatus.ACTIVE
  }

  close(): void {
    if (this._status === AccountStatus.CLOSED) throw new AccountAlreadyClosedError()
    if (!this._balance.isZero()) throw new AccountWithBalanceError()
    this._status = AccountStatus.CLOSED
  }

  // TODO(accounting): la convención de signo de DEBIT/CREDIT depende de AccountType.
  // Hoy ASSET y EXPENSE funcionan porque aplican +debit / -credit.
  // LIABILITY, EQUITY y REVENUE tienen la convención invertida (-debit / +credit).
  // Para MVP solo se usan ASSET y EXPENSE; cuando se abran los otros tipos hay que
  // pasar el `type` de la cuenta (o normalizar el signo en el aggregate) para que
  // el balance quede correcto.
  applyDebit(amount: Money): void {
    this.assertCanOperate()
    this.assertCurrency(amount)
    this._balance = this._balance.add(amount)
  }

  applyCredit(amount: Money): void {
    this.assertCanOperate()
    this.assertCurrency(amount)
    this._balance = this._balance.subtract(amount)
  }

  private assertCanOperate(): void {
    if (!this.canOperate()) throw new AccountNotOperableError(this.id)
  }

  private assertCurrency(amount: Money): void {
    if (!amount.currency.equals(this.currency)) throw new AccountCurrencyMismatchError()
  }

  private validate(): void {
    this.assertParentAccount()
    this.assertBalanceCurrency()
  }

  private assertParentAccount(): void {
    if (this.parentAccountId && this.parentAccountId.equals(this.id))
      throw new SelfParentAccountError()
  }

  private assertBalanceCurrency(): void {
    if (!this._balance.currency.equals(this.currency))
      throw new Error('La moneda del balance no coincide con la cuenta')
  }
}
