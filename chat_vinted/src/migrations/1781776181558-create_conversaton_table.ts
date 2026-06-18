import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateConversatonTable1781776181558 implements MigrationInterface {
    private readonly tableName = 'conversations';

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const exisTable = await queryRunner.hasTable(this.tableName);
            if (exisTable) {
                console.log(`The table ${this.tableName} already exist`);
                return;
            }

            await queryRunner.createTable(
                new Table({
                    name: 'conversations',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        {
                            name: 'listing_id',
                            type: 'int',
                        },
                        {
                            name: 'buyer_id',
                            type: 'int',
                        },
                        {
                            name: 'seller_id',
                            type: 'int',
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
