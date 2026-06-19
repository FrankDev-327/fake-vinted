import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class AlterRelationMessageConversationTables1781862554942 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const table = await queryRunner.getTable('messages');
            const wrongForeignKey = table.foreignKeys.find(
                (fk) => fk.columnNames.indexOf('conversation_id') !== -1,
            );

            // drop it if found
            if (wrongForeignKey) {
                await queryRunner.dropForeignKey('messages', wrongForeignKey);
            }

            await queryRunner.createForeignKey(
                'messages',
                new TableForeignKey({
                    name: 'FK_messages_conversation_id_conversations',
                    columnNames: ['conversation_id'],
                    referencedColumnNames: ['id'],
                    referencedTableName: 'conversations',
                    onDelete: 'CASCADE',
                }),
            );
        } catch (error) {
            console.log(`Error during the fix tables process ${(error as Error).message}`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.dropForeignKey('messages', 'FK_messages_conversation_id_conversations');
            await queryRunner.createForeignKey(
                'messages',
                new TableForeignKey({
                    name: 'FK_messages_conversation_id_wrong',
                    columnNames: ['conversation_id'],
                    referencedColumnNames: ['id'],
                    referencedTableName: 'messages',
                    onDelete: 'CASCADE',
                }),
            );
        } catch (error) {
            console.log(`Error during the dropping fix tables process ${(error as Error).message}`);
        }
    }

}
