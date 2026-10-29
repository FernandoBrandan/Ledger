import { Body, Controller, Post } from '@nestjs/common'

import { TransferUseCase } from '../application/transaction/use-cases/transfer.usecase'
import { TransferRequestDto } from '../application/transaction/dto/request/transfer.request.dto'

import { TransactionResponseDto } from '../application/transaction/dto/response/transaction.response.dto'

import { Transaction } from '../domain/transaction.entity'

function toTransactionResponse(tx: Transaction): TransactionResponseDto {
  return {
    id: tx.id.value,
    reference: tx.reference,
    status: tx.status,
    occurredAt: tx.occurredAt.toISOString(),
    createdAt: tx.createdAt.toISOString(),
    postedAt: tx.postedAt?.toISOString(),
    entries: tx.entries.map((e) => ({
      id: e.id.value,
      accountId: e.accountId.value,
      direction: e.direction,
      amount: e.amount.toDecimalString(),
      currency: e.amount.currency.code,
      createdAt: e.createdAt.toISOString(),
    })),
  }
}

@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfer: TransferUseCase) {}

  @Post()
  async create(@Body() dto: TransferRequestDto): Promise<TransactionResponseDto> {
    return toTransactionResponse(await this.transfer.execute(dto))
  }
}
