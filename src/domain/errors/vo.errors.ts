import { DomainValidationError, DomainRuleError } from './domain.error'

// --- Currency ---
export class InvalidCurrencyCodeError extends DomainValidationError {
  readonly code = 'INVALID_CURRENCY_CODE'
  constructor(received: string) {
    super(`Currency debe ser un código ISO 4217 de 3 letras mayúsculas (recibido: "${received}")`)
  }
}

// --- EntityId ---
export class InvalidEntityIdError extends DomainValidationError {
  readonly code = 'INVALID_ENTITY_ID'
  constructor() {
    super('EntityId no puede estar vacío')
  }
}

// --- Money ---
export class CurrencyMismatchError extends DomainRuleError {
  readonly code = 'CURRENCY_MISMATCH'
  constructor() {
    super('No se pueden operar monedas distintas')
  }
}

export class InvalidAmountError extends DomainRuleError {
  readonly code = 'INVALID_AMOUNT'
  constructor() {
    super('El monto de un asiento debe ser positivo')
  }
}
