import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateAccounts1728000000000 implements MigrationInterface {
  name = 'CreateAccounts1728000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'accounts',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'ownerId', type: 'varchar', isNullable: false },
          { name: 'type', type: 'varchar', isNullable: false },
          {
            name: 'balance',
            type: 'decimal',
            precision: 19,
            scale: 4,
            default: '0',
            isNullable: false,
          },
          { name: 'currency', type: 'char', length: '3', isNullable: false },
          { name: 'parentAccountId', type: 'uuid', isNullable: true },
          { name: 'status', type: 'varchar', isNullable: false },
          { name: 'createdAt', type: 'timestamp', default: 'now()', isNullable: false },
        ],
        indices: [
          { name: 'IDX_accounts_ownerId', columnNames: ['ownerId'] },
          { name: 'IDX_accounts_type', columnNames: ['type'] },
        ],
        foreignKeys: [
          {
            name: 'FK_accounts_parentAccountId',
            columnNames: ['parentAccountId'],
            referencedTableName: 'accounts',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true, // ifNotExists
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('accounts', true)
  }
}
