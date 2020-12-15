import {MigrationInterface, QueryRunner} from "typeorm";

export class PublishedDateAddition1608019472313 implements MigrationInterface {
    name = 'PublishedDateAddition1608019472313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."posts" ADD "publishedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."posts" DROP COLUMN "publishedAt"`);
    }

}
