import { Body, Controller, Get, Param, Post } from '@nestjs/common'

import { CreateTransactionUseCase } from '../application/transaction/use-cases/create-transaction.usecase'
import { GetTransactionUseCase } from '../application/transaction/use-cases/get-transaction.usecase'
import { PostTransactionUseCase } from '../application/transaction/use-cases/post-transaction.usecase'

import { CreateTransactionDto } from '../application/transaction/dto/request/create-transaction.request.dto'
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

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly getTransaction: GetTransactionUseCase,
    private readonly postTransaction: PostTransactionUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto): Promise<TransactionResponseDto> {
    return toTransactionResponse(await this.createTransaction.execute(dto))
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TransactionResponseDto> {
    return toTransactionResponse(await this.getTransaction.execute(id))
  }

  @Post(':id/post')
  async post(@Param('id') id: string): Promise<TransactionResponseDto> {
    return toTransactionResponse(await this.postTransaction.execute(id))
  }
}
