import { Transaction } from '../../../../domain/transaction.entity'

export interface EntryResponseDto {
  id: string
  accountId: string
  direction: string
  amount: string
  currency: string
  createdAt: string
}

export interface TransactionResponseDto {
  id: string
  reference: string
  status: string
  occurredAt: string
  createdAt: string
  postedAt?: string
  entries: EntryResponseDto[]
}
