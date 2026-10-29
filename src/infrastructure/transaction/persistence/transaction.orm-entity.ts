// src/infrastructure/transaction/persistence/transaction.orm-entity.ts
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'
import { EntryEntity } from './entry.orm-entity'

@Entity('transactions')
export class TransactionEntity {
  @PrimaryColumn('uuid')
  id: string

  @Column({ type: 'varchar' })
  reference: string

  @Column({ type: 'varchar' })
  status: string

  @Column({ type: 'timestamp' })
  occurredAt: Date

  @Column({ type: 'timestamp' })
  createdAt: Date

  @Column({ type: 'timestamp', nullable: true })
  postedAt: Date | null

  @OneToMany(() => EntryEntity, (entry) => entry.transaction, {
    cascade: ['insert'],
    eager: true,
  })
  entries: EntryEntity[]
}
