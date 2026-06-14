import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateFirstUserTable1781461119443 implements MigrationInterface {
    private readonly tableName = 'users';
    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const tableExists = await queryRunner.hasTable(this.tableName);
            if (!tableExists) {
                console.log('User table already exists. Skipping creation.');
                return;
            }

            await queryRunner.createTable(new Table({
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
                        name: 'username',
                        type: 'varchar',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'password',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'full_name',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'avatar_url',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'bio',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'city',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'country',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'rating',
                        type: 'decimal',
                        precision: 3,
                        scale: 2,
                        default: 0,
                        isNullable: true,
                    },
                    {
                        name: 'total_reviews',
                        type: 'int',
                        default: 0,
                        isNullable: true,
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'is_verified',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    }
                ],
            }));

            console.log('User table created successfully.');
        } catch (error) {
            console.log(`Error creating user table: ${(error as Error).message}`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const tableExists = await queryRunner.hasTable(this.tableName);
            if (tableExists) {
                await queryRunner.dropTable(this.tableName);
                console.log('User table dropped successfully.');
                return;
            } else {
                console.log('User table does not exist. Skipping drop.');
            }
        } catch (error) {
            console.log(`Error dropping user table: ${(error as Error).message}`);
        }
    }
}
