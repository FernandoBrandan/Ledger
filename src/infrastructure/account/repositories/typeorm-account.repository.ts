// pr_ledger/src/infrastructure/account/repositories/typeorm-account.repository.ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Account } from '../../../domain/account.entity'
import { AccountRepository } from '../../../domain/repositories/account.repository'

import { AccountEntity } from '../persistence/account.orm-entity'
import { AccountType } from '../../../domain/enums'
import { EntityId } from '../../../domain/vo/entity-id.vo'
import { AccountMapper } from '../persistence/account.mapper'

@Injectable()
export class TypeOrmAccountRepository implements AccountRepository {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly ormRepo: Repository<AccountEntity>,
  ) {}

  async getAll(): Promise<Account[]> {
    try {
      const orm = await this.ormRepo.find()
      return orm.map(AccountMapper.toDomain)
    } catch (error) {
      this.handleConnectionError(error)
    }
  }

  async findById(id: EntityId): Promise<Account | null> {
    try {
      const orm = await this.ormRepo.findOne({ where: { id: id.toString() } })
      return orm ? AccountMapper.toDomain(orm) : null
    } catch (error) {
      this.handleConnectionError(error)
    }
  }
  async findByOwner(ownerId: string): Promise<Account[]> {
    try {
      const orm = await this.ormRepo.find({ where: { ownerId } })
      return orm.map(AccountMapper.toDomain)
    } catch (error) {
      this.handleConnectionError(error)
    }
  }
  async findByType(type: AccountType): Promise<Account[]> {
    try {
      const orm = await this.ormRepo.find({ where: { type } })
      return orm.map(AccountMapper.toDomain)
    } catch (error) {
      this.handleConnectionError(error)
    }
  }
  async save(account: Account): Promise<void> {
    try {
      const entity = this.ormRepo.create(AccountMapper.toPersistence(account))
      await this.ormRepo.save(entity)
    } catch (error) {
      this.handleConnectionError(error)
    }
  }

  private handleConnectionError(error: any): never {
    const isConnectionError =
      error.code === 'ECONNREFUSED' ||
      error.message?.includes('connect ETIMEDOUT') ||
      error.message?.includes('Connection terminated') ||
      error.message?.includes('Connection lost')
    if (isConnectionError) {
      throw new Error('InfrastructureException: Database connection failed', error)
    }
    throw error
  }
}
