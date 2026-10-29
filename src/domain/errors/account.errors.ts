import { DomainConflictError, DomainRuleError } from './domain.error'
import { EntityId } from '../vo/entity-id.vo'

export class AccountNotOperableError extends DomainConflictError {
  readonly code = 'ACCOUNT_NOT_OPERABLE'
  constructor(id: EntityId | string) {
    super(`La cuenta ${id} no está operativa`)
  }
}

export class InvalidAccountStateError extends DomainConflictError {
  readonly code = 'INVALID_ACCOUNT_STATE'
  constructor(action: string, expected: string, actual: string) {
    super(`No se puede ${action}: se esperaba estado ${expected}, actual ${actual}`)
  }
}

export class AccountAlreadyClosedError extends DomainConflictError {
  readonly code = 'ACCOUNT_ALREADY_CLOSED'
  constructor() {
    super('La cuenta ya está cerrada')
  }
}

export class AccountWithBalanceError extends DomainConflictError {
  readonly code = 'ACCOUNT_WITH_BALANCE'
  constructor() {
    super('No se puede cerrar una cuenta con saldo')
  }
}

export class AccountCurrencyMismatchError extends DomainRuleError {
  readonly code = 'ACCOUNT_CURRENCY_MISMATCH'
  constructor() {
    super('La moneda del movimiento no coincide con la cuenta')
  }
}

export class SelfParentAccountError extends DomainRuleError {
  readonly code = 'SELF_PARENT_ACCOUNT'
  constructor() {
    super('Una cuenta no puede ser su propio padre')
  }
}

export class InsufficientBalanceError extends DomainRuleError {
  readonly code = 'INSUFFICIENT_BALANCE'
  constructor(accountId: string, available: string, requested: string) {
    super(
      `Saldo insuficiente en cuenta ${accountId}: disponible ${available}, solicitado ${requested}`,
    )
  }
}
