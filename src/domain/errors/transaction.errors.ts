import { DomainConflictError, DomainRuleError, DomainValidationError } from './domain.error'
import { Money } from '../vo/money.vo'

// --- Entry ---
export class EntryAlreadyLinkedError extends DomainConflictError {
  readonly code = 'ENTRY_ALREADY_LINKED'
  constructor() {
    super('El asiento ya está vinculado a una transacción')
  }
}

export class EntryNotLinkedError extends DomainConflictError {
  readonly code = 'ENTRY_NOT_LINKED'
  constructor() {
    super('El asiento no está vinculado a una transacción')
  }
}

// --- Transaction ---
export class MissingReferenceError extends DomainValidationError {
  readonly code = 'MISSING_REFERENCE'
  constructor() {
    super('La transacción requiere un reference')
  }
}

export class TransactionNotEditableError extends DomainConflictError {
  readonly code = 'TRANSACTION_NOT_EDITABLE'
  constructor() {
    super('La transacción ya no es editable')
  }
}

export class TransactionNotBalancedError extends DomainRuleError {
  readonly code = 'TRANSACTION_NOT_BALANCED'
  constructor(debit: Money, credit: Money) {
    super(`La transacción no balancea: débitos=${debit} créditos=${credit}`)
  }
}

export class NotEnoughEntriesError extends DomainRuleError {
  readonly code = 'NOT_ENOUGH_ENTRIES'
  constructor() {
    super('Una transacción requiere al menos dos asientos')
  }
}

export class SameAccountTransferError extends DomainValidationError {
  readonly code = 'SAME_ACCOUNT_TRANSFER'
  constructor() {
    super('La cuenta origen y destino no pueden ser la misma')
  }
}

export class TransactionNotPostedError extends DomainConflictError {
  readonly code = 'TRANSACTION_NOT_POSTED'
  constructor() {
    super('Solo se puede reversar una transacción POSTED')
  }
}
