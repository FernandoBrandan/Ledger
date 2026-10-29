// src/infrastructure/account/persistence/account.orm-entity.ts
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('accounts')
export class AccountEntity {
  @PrimaryColumn('uuid')
  id!: string

  @Column({ type: 'varchar' })
  ownerId!: string

  @Column({ type: 'varchar' })
  type!: string

  @Column({ type: 'decimal', precision: 19, scale: 4 })
  balance!: string

  @Column({ type: 'char', length: 3 })
  currency!: string

  @Column({ type: 'uuid', nullable: true })
  parentAccountId!: string | null

  @Column({ type: 'varchar' })
  status!: string

  @Column({ type: 'timestamp' })
  createdAt!: Date
}
