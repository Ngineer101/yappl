import {MigrationInterface, QueryRunner} from "typeorm";

export class PublicationImageUrlAddition1607099378937 implements MigrationInterface {
    name = 'PublicationImageUrlAddition1607099378937'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."publications" ADD "imageUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."publications" DROP COLUMN "imageUrl"`);
    }

}
