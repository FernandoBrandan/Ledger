import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'

import { CreateAccountUseCase } from '../application/account/use-cases/create-account.usecase'
import { GetAccountUseCase } from '../application/account/use-cases/get-account.usecase'
import { ListAccountsUseCase } from '../application/account/use-cases/list-accounts.usecase'
import { ActivateAccountUseCase } from '../application/account/use-cases/activate-account.usecase'

import { CreateAccountDto } from '../application/account/dto/request/create-account.request.dto'
import { AccountResponseDto } from '../application/account/dto/response/account.response.dto'

import { Account } from '../domain/account.entity'
import { AccountType } from '../domain/enums'

function toAccountResponse(a: Account): AccountResponseDto {
  return {
    id: a.id.value,
    ownerId: a.ownerId,
    type: a.type,
    status: a.status,
    balance: a.balance.toDecimalString(),
    currency: a.currency.code,
    parentAccountId: a.parentAccountId?.value,
    createdAt: a.createdAt.toISOString(),
  }
}

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly createAccount: CreateAccountUseCase,
    private readonly getAccount: GetAccountUseCase,
    private readonly listAccounts: ListAccountsUseCase,
    private readonly activateAccount: ActivateAccountUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateAccountDto): Promise<AccountResponseDto> {
    return toAccountResponse(await this.createAccount.execute(dto))
  }

  /**
   * Lista cuentas por tipo.
   * ListAccountsUseCase actualmente lanza error si `type` no viene.
   * Si querés "traer todas", hay que modificar ese use case (o el repo tiene getAll()).
   */
  @Get()
  async list(@Query('type') type?: AccountType): Promise<AccountResponseDto[]> {
    console.log('accounts')

    const accounts = await this.listAccounts.execute(type)
    return accounts.map(toAccountResponse)
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AccountResponseDto | null> {
    const account = await this.getAccount.execute(id)
    return account ? toAccountResponse(account) : null
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string): Promise<AccountResponseDto> {
    return toAccountResponse(await this.activateAccount.execute(id))
  }
}
