import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { EntityId } from '../../../domain/vo/entity-id.vo'
import { Transaction } from '../../../domain/transaction.entity'
import { TransactionRepository } from '../../../domain/repositories/transaction.repository'

import { TransactionMapper } from '../persistence/transaction.mapper'
import { TransactionEntity } from '../persistence/transaction.orm-entity'

@Injectable()
export class TypeOrmTransactionRepository implements TransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly ormRepo: Repository<TransactionEntity>,
  ) {}

  async findById(id: EntityId): Promise<Transaction | null> {
    try {
      const orm = await this.ormRepo.findOne({
        where: { id: id.value },
        relations: { entries: true },
      })
      return orm ? TransactionMapper.toDomain(orm) : null
    } catch (error) {
      this.handleConnectionError(error)
    }
  }

  async save(transaction: Transaction): Promise<void> {
    try {
      const entity = this.ormRepo.create(TransactionMapper.toPersistence(transaction))
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
