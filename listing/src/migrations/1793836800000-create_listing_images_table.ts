import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CreateListingImagesTable1793836800000 implements MigrationInterface {
    private readonly tableName = 'listing_images';

    public async up(queryRunner: QueryRunner): Promise<void> {
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
                        name: 'listing_id',
                        type: 'int',
                    },
                    {
                        name: 's3_key',
                        type: 'varchar',
                        isUnique: true,
                    },
                    {
                        name: 'content_type',
                        type: 'varchar',
                    },
                    {
                        name: 'size_bytes',
                        type: 'int',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                ],
                foreignKeys: [
                    {
                        name: 'listing_images_listing_id_fkey',
                        columnNames: ['listing_id'],
                        referencedTableName: 'listings',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
                indices: [
                    {
                        name: 'listing_images_listing_id_idx',
                        columnNames: ['listing_id'],
                    },
                ],
            }),
        );

        await queryRunner.dropColumn('listings', 'images');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'listings',
            new TableColumn({
                name: 'images',
                type: 'text',
                isNullable: true,
            }),
        );

        await queryRunner.dropTable(this.tableName);
    }
}
