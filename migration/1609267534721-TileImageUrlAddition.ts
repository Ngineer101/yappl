import {MigrationInterface, QueryRunner} from "typeorm";

export class TileImageUrlAddition1609267534721 implements MigrationInterface {
    name = 'TileImageUrlAddition1609267534721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."posts" ADD "tileImageUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."posts" DROP COLUMN "tileImageUrl"`);
    }

}
