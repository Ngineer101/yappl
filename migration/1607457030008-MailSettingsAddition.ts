import {MigrationInterface, QueryRunner} from "typeorm";

export class MailSettingsAddition1607457030008 implements MigrationInterface {
    name = 'MailSettingsAddition1607457030008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "public"."mailSettings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider" character varying NOT NULL DEFAULT 'none', "mailgunApiKey" character varying, "mailgunDomain" character varying, "mailgunHost" character varying, CONSTRAINT "UQ_cd4630a600e36e62cc70cc99af6" UNIQUE ("provider"), CONSTRAINT "PK_068d34a055b3a6c6a7b33d0ccb9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "public"."publications" ADD "mailSettingsId" uuid`);
        await queryRunner.query(`ALTER TABLE "public"."publications" ADD CONSTRAINT "UQ_b834f3443c729e5105edd12da13" UNIQUE ("mailSettingsId")`);
        await queryRunner.query(`ALTER TABLE "public"."publications" ADD CONSTRAINT "FK_b834f3443c729e5105edd12da13" FOREIGN KEY ("mailSettingsId") REFERENCES "public"."mailSettings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."publications" DROP CONSTRAINT "FK_b834f3443c729e5105edd12da13"`);
        await queryRunner.query(`ALTER TABLE "public"."publications" DROP CONSTRAINT "UQ_b834f3443c729e5105edd12da13"`);
        await queryRunner.query(`ALTER TABLE "public"."publications" DROP COLUMN "mailSettingsId"`);
        await queryRunner.query(`DROP TABLE "public"."mailSettings"`);
    }

}
