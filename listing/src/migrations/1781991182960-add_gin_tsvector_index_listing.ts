import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGinTsvectorIndexListing1781991182960 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            // add tsvector column
            await queryRunner.query(`
                ALTER TABLE listings ADD COLUMN IF NOT EXISTS search_vector tsvector;
            `);

            // populate existing rows
            await queryRunner.query(`
                UPDATE listings 
                SET search_vector = to_tsvector('english', 
                    coalesce(title, '') || ' ' || 
                    coalesce(description, '') || ' ' || 
                    coalesce(brand, '') || ' ' ||
                    coalesce(category, '') || ' ' ||
                    coalesce(location, '')
                );
            `);

            // create GIN index
            await queryRunner.query(`
                CREATE INDEX IF NOT EXISTS listings_search_idx ON listings USING GIN(search_vector);
            `);

            // create trigger to auto update search_vector on insert/update
            await queryRunner.query(`
                CREATE OR REPLACE FUNCTION listings_search_vector_update() RETURNS trigger AS $$
                BEGIN
                    NEW.search_vector := to_tsvector('english',
                    coalesce(NEW.title, '') || ' ' ||
                    coalesce(NEW.description, '') || ' ' ||
                    coalesce(NEW.brand, '') || ' ' ||
                    coalesce(NEW.category, '') || ' ' ||
                    coalesce(NEW.location, '')
                    );
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `);

            await queryRunner.query(`
                CREATE TRIGGER listings_search_vector_trigger
                BEFORE INSERT OR UPDATE ON listings
                FOR EACH ROW EXECUTE FUNCTION listings_search_vector_update();
            `)

        } catch (error) {
            console.log("Error creating indexes", (error as Error).message);

        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query(`DROP TRIGGER IF EXISTS listings_search_vector_trigger ON listings;`);
            await queryRunner.query(`DROP FUNCTION IF EXISTS listings_search_vector_update;`);
            await queryRunner.query(`DROP INDEX IF EXISTS listings_search_idx;`);
            await queryRunner.query(`ALTER TABLE listings DROP COLUMN IF EXISTS search_vector;`);
        } catch (error) {
            console.log("Error dropping indexes", (error as Error).message);
        }
    }

}
