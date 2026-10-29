// pr_ledger/src/application/transaction/use-cases/transfer.usecase.ts
import { Inject, Injectable } from '@nestjs/common'
import { Transaction } from '@domain/transaction.entity'
import { AccountRepository } from '@domain/repositories/account.repository'
import { EntityId } from '@domain/vo/entity-id.vo'
import { Currency } from '@domain/vo/currency.vo'
import { Money } from '@domain/vo/money.vo'
import { PostingService } from '../services/posting.service'
import { TransferRequestDto } from '../dto/request/transfer.request.dto'
import { ACCOUNT_REPOSITORY, LOGGER } from '@shared/tokens'
import { Logger } from '@shared/logger/logger.interface'
import { SameAccountTransferError } from '@domain/errors/transaction.errors'
import { DomainNotFoundError } from '@domain/errors/domain.error'
import {
  AccountCurrencyMismatchError,
  AccountNotOperableError,
  InsufficientBalanceError,
} from '@domain/errors/account.errors'
import { InvalidAmountError } from '@domain/errors/vo.errors'

@Injectable()
export class TransferUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly repoAccount: AccountRepository,

    private readonly servicePost: PostingService,

    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(dto: TransferRequestDto): Promise<Transaction> {
    if (dto.sourceAccountId === dto.destinationAccountId) throw new SameAccountTransferError()

    const currency = Currency.from(dto.currencyCode)
    const source = await this.repoAccount.findById(EntityId.from(dto.sourceAccountId))
    if (!source) throw new DomainNotFoundError('Account', dto.sourceAccountId)
    if (!source.canOperate()) throw new AccountNotOperableError(source.id)
    if (!source.currency.equals(currency)) throw new AccountCurrencyMismatchError()

    const dest = await this.repoAccount.findById(EntityId.from(dto.destinationAccountId))
    if (!dest) throw new DomainNotFoundError('Account', dto.destinationAccountId)
    if (!dest.canOperate()) throw new AccountNotOperableError(dest.id)
    if (!dest.currency.equals(currency)) throw new AccountCurrencyMismatchError()

    const money = Money.of(dto.amount, currency)
    if (!money.isPositive()) throw new InvalidAmountError()

    if (source.balance.subtract(money).isNegative())
      throw new InsufficientBalanceError(
        source.id.value,
        source.balance.toDecimalString(),
        money.toDecimalString(),
      )

    const tx = Transaction.create({
      id: EntityId.create(),
      reference: dto.reference,
      occurredAt: new Date(),
    })

    tx.addDebit({ id: EntityId.create(), accountId: dest.id, amount: money })
    tx.addCredit({ id: EntityId.create(), accountId: source.id, amount: money })

    const posted = await this.servicePost.post(tx)

    this.logger.info('Transfer posted', {
      transactionId: posted.id.value,
      sourceAccountId: source.id.value,
      destinationAccountId: dest.id.value,
      amount: money.toDecimalString(),
      currency: currency.code,
      reference: dto.reference,
    })

    return posted
  }
}
