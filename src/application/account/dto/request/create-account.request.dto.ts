// interfaces/http/accounting/dto/account.dto.ts
import { IsEnum, IsOptional, IsString, Length } from 'class-validator'
import { AccountType } from '../../../../domain/enums'

export class CreateAccountDto {
  @IsString()
  ownerId: string

  @IsEnum(AccountType)
  type: AccountType

  @IsString()
  @Length(3, 3)
  currencyCode: string

  @IsOptional()
  @IsString()
  parentAccountId?: string
}
