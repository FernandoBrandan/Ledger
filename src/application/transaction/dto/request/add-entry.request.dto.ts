import { IsString, Length } from 'class-validator'
import { EntryDirection } from '../../../../domain/enums'

export class AddEntryRequestDto {
  @IsString()
  accountId: string

  @IsString()
  transactionId: string

  @IsString()
  direction: EntryDirection

  @IsString()
  amount: string

  @IsString()
  @Length(3, 3)
  currency: string
}
