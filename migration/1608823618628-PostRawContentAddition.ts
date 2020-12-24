import {MigrationInterface, QueryRunner} from "typeorm";

export class PostRawContentAddition1608823618628 implements MigrationInterface {
    name = 'PostRawContentAddition1608823618628'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."posts" ADD "rawContent" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."posts" DROP COLUMN "rawContent"`);
    }

}
