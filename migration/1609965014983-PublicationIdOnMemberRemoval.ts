import {MigrationInterface, QueryRunner} from "typeorm";

export class PublicationIdOnMemberRemoval1609965014983 implements MigrationInterface {
    name = 'PublicationIdOnMemberRemoval1609965014983'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_df5675dc1172ee80f697d7d993"`);
        await queryRunner.query(`ALTER TABLE "public"."members" DROP COLUMN "publicationId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."members" ADD "publicationId" uuid NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_df5675dc1172ee80f697d7d993" ON "public"."members" ("publicationId") `);
    }

}
