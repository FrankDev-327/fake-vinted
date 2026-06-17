import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateListingTable1781728094636 implements MigrationInterface {
    private readonly tableName = 'listings'

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const existTable = await queryRunner.hasTable(this.tableName);
            if (existTable) {
                console.log(`The table ${this.tableName} already exist`);
                return;
            }

            await queryRunner.query(`
                CREATE TYPE listing_condition AS ENUM ('new', 'like_new', 'good', 'fair');
                CREATE TYPE listing_status AS ENUM ('available', 'reserved', 'sold');
            `);

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
                            name: 'user_id',
                            type: 'int',
                        },
                        {
                            name: 'title',
                            type: 'varchar',
                        },
                        {
                            name: 'description',
                            type: 'text',
                        },
                        {
                            name: 'price',
                            type: 'decimal',
                            precision: 10,
                            scale: 2,
                        },
                        {
                            name: 'category',
                            type: 'varchar',
                        },
                        {
                            name: 'brand',
                            type: 'varchar',
                            isNullable: true,
                        },
                        {
                            name: 'size',
                            type: 'varchar',
                            isNullable: true,
                        },
                        {
                            name: 'condition',
                            type: 'listing_condition',
                            default: "'good'",
                        },
                        {
                            name: 'status',
                            type: 'listing_status',
                            default: "'available'",
                        },
                        {
                            name: 'images',
                            type: 'text',
                            isNullable: true,
                        },
                        {
                            name: 'location',
                            type: 'varchar',
                            isNullable: true,
                        },
                        {
                            name: 'created_at',
                            type: 'timestamp',
                            default: 'now()',
                        },
                        {
                            name: 'updated_at',
                            type: 'timestamp',
                            default: 'now()',
                        },
                    ],
                }),
                true,
            );

            await queryRunner.query(`
                ALTER TABLE listings ADD COLUMN search_vector tsvector;
                UPDATE listings SET search_vector = to_tsvector('english', title || ' ' || description);
                CREATE INDEX listings_search_idx ON listings USING GIN(search_vector);
            `);

        } catch (error) {
            console.log(`Error creating listing table: ${(error as Error).message}`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const existTable = await queryRunner.hasTable(this.tableName);
            if (!existTable) {
                console.log(`The table ${this.tableName} already exist`);
                return;
            }

            await queryRunner.dropTable(this.tableName);
            await queryRunner.query(`
                DROP TYPE listing_condition;
                DROP TYPE listing_status;
            `);
        } catch (error) {
            console.log(`Error dropping listing table: ${(error as Error).message}`);
        }
    }

}
