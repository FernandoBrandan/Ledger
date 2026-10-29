// pr_ledger/src/application/transaction/dto/request/create-transaction.request.dto.ts
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { EntryDirection } from '../../../../domain/enums'

export class CreateTransactionDto {
  @IsString()
  @MaxLength(100)
  reference: string

  @IsDateString()
  occurredAt: Date

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionEntryDto)
  entries: CreateTransactionEntryDto[]
}

export class CreateTransactionEntryDto {
  @IsString()
  accountId: string

  @IsEnum(EntryDirection)
  direction: EntryDirection

  @IsString()
  amount: string

  @IsString()
  currency: string
}
