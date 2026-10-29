// src/infrastructure/transaction/persistence/entry.orm-entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { TransactionEntity } from './transaction.orm-entity'

@Entity('entries')
export class EntryEntity {
  @PrimaryColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  transactionId: string

  @Column({ type: 'uuid' })
  accountId: string

  @Column({ type: 'varchar' })
  direction: string

  @Column({ type: 'decimal', precision: 19, scale: 4 })
  amount: string

  @Column({ type: 'char', length: 3 })
  currency: string

  @Column({ type: 'timestamp' })
  createdAt: Date

  @ManyToOne(() => TransactionEntity, (tx) => tx.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transactionId' })
  transaction: TransactionEntity
}
