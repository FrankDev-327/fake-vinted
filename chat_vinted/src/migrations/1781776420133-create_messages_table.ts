import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateMessagesTable1781776420133 implements MigrationInterface {
    private readonly tableName = 'messages';

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const exisTable = await queryRunner.hasTable(this.tableName);
            if (exisTable) {
                console.log(`The table ${this.tableName} already exist`);
                return;
            }

            await queryRunner.createTable(
                new Table({
                    name: this.tableName,
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        {
                            name: 'conversation_id',
                            type: 'int',
                        },
                        {
                            name: 'sender_id',
                            type: 'int',
                        },
                        {
                            name: 'content',
                            type: 'text',
                        },
                        {
                            name: 'is_read',
                            type: 'boolean',
                            default: false,
                        },
                        {
                            name: 'created_at',
                            type: 'timestamp',
                            default: 'now()',
                        },
                    ],
                }),
                true,
            );

            await queryRunner.createForeignKey(
                'messages',
                new TableForeignKey({
                    columnNames: ['conversation_id'],
                    referencedColumnNames: ['id'],
                    referencedTableName: this.tableName,
                    onDelete: 'CASCADE',
                }),
            );
        } catch (error) {
            console.log(`Error during creating ${this.tableName}: ${(error as Error).message}`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const exisTable = await queryRunner.hasTable(this.tableName);
            if (!exisTable) {
                console.log(`The table ${this.tableName} does not exist`);
                return;
            }

            await queryRunner.dropTable(this.tableName);
        } catch (error) {
            console.log(`Error during dropping ${this.tableName}: ${(error as Error).message}`);

        }
    }

}
