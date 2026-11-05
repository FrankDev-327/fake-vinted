import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProcessingToListingImages1793923200000 implements MigrationInterface {
    private readonly tableName = 'listing_images';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns(this.tableName, [
            new TableColumn({
                name: 'status',
                type: 'enum',
                enum: ['pending', 'ready', 'rejected'],
                enumName: 'listing_image_status',
                default: "'pending'",
            }),
            new TableColumn({ name: 'rejection_code', type: 'varchar', isNullable: true }),
            new TableColumn({ name: 'rejection_message', type: 'varchar', isNullable: true }),
            new TableColumn({ name: 'thumbnail_key', type: 'varchar', isNullable: true }),
            new TableColumn({ name: 'width', type: 'int', isNullable: true }),
            new TableColumn({ name: 'height', type: 'int', isNullable: true }),
        ]);

        // Images from before this migration were already validated when they were confirmed
        await queryRunner.manager
            .createQueryBuilder()
            .update(this.tableName)
            .set({ status: 'ready' })
            .execute();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns(this.tableName, [
            'status',
            'rejection_code',
            'rejection_message',
            'thumbnail_key',
            'width',
            'height',
        ]);
    }
}
