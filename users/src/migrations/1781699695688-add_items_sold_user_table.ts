import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddItemsSoldUserTable1781699695688 implements MigrationInterface {
    private readonly tableName = 'users';
    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const columnExist = await queryRunner.hasColumn(this.tableName, 'items_sold');
            if (columnExist) {
                console.log('This column already exist.');
                return;
            }

            await queryRunner.addColumn(
                this.tableName,
                new TableColumn({
                    name: 'items_sold',
                    type: 'int',
                    default: 0
                })
            )
        } catch (error) {
            console.log(`Error adding new column into user table: ${(error as Error).message}`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const columnExist = await queryRunner.hasColumn(this.tableName, 'items_sold');
            if (!columnExist) {
                console.log('This column does not exist.');
                return;
            }

            await queryRunner.dropColumn(this.tableName, 'items_sold')
        } catch (error) {

        }
    }

}
