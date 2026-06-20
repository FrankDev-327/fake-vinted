import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateNotificationTable1781940719324 implements MigrationInterface {
    private readonly tableName = 'notificaions'

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const existTable = await queryRunner.hasTable(this.tableName);
            if (existTable) {
                console.log(`Table ${this.tableName} already exist`);
                return;
            }

            await queryRunner.query(`
                CREATE TYPE notification_type AS ENUM (
                    'new_message',
                    'item_sold',
                    'offer_accepted',
                    'offer_rejected',
                    'item_shipped'
                );
            `);

            await queryRunner.createTable(
                new Table({
                    name: 'notifications',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        {
                            name: 'user_id',
                            type: 'int',
                        },
                        {
                            name: 'type',
                            type: 'notification_type',
                        },
                        {
                            name: 'title',
                            type: 'varchar',
                        },
                        {
                            name: 'message',
                            type: 'text',
                        },
                        {
                            name: 'is_read',
                            type: 'boolean',
                            default: false,
                        },
                        {
                            name: 'metadata',
                            type: 'jsonb',
                            isNullable: true,
                            comment: 'Extra data like listing_id, conversation_id, sender_id etc',
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
        }

        catch (error) {
            console.log(`Error creating table: ${this.tableName} ${(error as Error).message}`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const existTable = await queryRunner.hasTable(this.tableName);
            if (!existTable) {
                console.log(`Table ${this.tableName} does not exist`);
                return;
            }

            await queryRunner.dropTable('notifications');
            await queryRunner.query(`DROP TYPE notification_type;`);
        } catch (error) {
            console.log(`Error dropping table: ${this.tableName} ${(error as Error).message}`);
        }
    }

}
