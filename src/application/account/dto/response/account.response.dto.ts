import { AccountType } from '../../../../domain/enums'

export class AccountResponseDto {
  id: string
  ownerId: string
  type: AccountType
  status: string
  balance: string
  currency: string
  parentAccountId?: string
  createdAt: string
}
