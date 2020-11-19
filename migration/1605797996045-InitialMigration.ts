import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialMigration1605797996045 implements MigrationInterface {
    name = 'InitialMigration1605797996045'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "public"."accounts" ("id" SERIAL NOT NULL, "compound_id" character varying NOT NULL, "user_id" integer NOT NULL, "provider_type" character varying NOT NULL, "provider_id" character varying NOT NULL, "provider_account_id" character varying NOT NULL, "refresh_token" text NOT NULL, "access_token" text NOT NULL, "access_token_expires" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_650c26a7da1c44b70a204eb1253" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ea1b53d5c2b341272169ee5f20" ON "public"."accounts" ("compound_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ba411186708c0e0fdb6df3a783" ON "public"."accounts" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_0f28e47352cb12dd77afef2f49" ON "public"."accounts" ("provider_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_295f09de7bcff45388d4525849" ON "public"."accounts" ("provider_account_id") `);
        await queryRunner.query(`CREATE TABLE "public"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying, "passwordHash" character varying, "emailVerified" TIMESTAMP WITH TIME ZONE, "image" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_12ffa5c867f6bb71e2690a526ce" UNIQUE ("email"), CONSTRAINT "PK_a6cc71bedf15a41a5f5ee8aea97" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_12ffa5c867f6bb71e2690a526c" ON "public"."users" ("email") `);
        await queryRunner.query(`CREATE TABLE "public"."publications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" character varying, "userId" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_3cee6729ac0e9a30f543aaad7a7" UNIQUE ("name"), CONSTRAINT "PK_b8ae8c9aaf62e49d559596f0711" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "public"."posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(250) NOT NULL, "subtitle" character varying, "canonicalUrl" character varying NOT NULL, "slug" character varying, "htmlContent" character varying, "authorName" character varying NOT NULL, "authorImage" character varying, "isPublished" boolean NOT NULL DEFAULT false, "source" character varying NOT NULL, "publicationId" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_c2d7547ee6b24ad9348beff86d6" UNIQUE ("canonicalUrl"), CONSTRAINT "UQ_96e061cadcbc5f66636236bd15a" UNIQUE ("slug"), CONSTRAINT "PK_8ed8d3bde047700b500cfbf1fef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_96e061cadcbc5f66636236bd15" ON "public"."posts" ("slug") `);
        await queryRunner.query(`CREATE TABLE "public"."members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "name" character varying, "emailVerified" boolean NOT NULL DEFAULT false, "publicationId" uuid NOT NULL, "verificationToken" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_0255c8c4924daa02cea03365e18" UNIQUE ("email"), CONSTRAINT "PK_33423cc83aa0869b25caff3ab52" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0255c8c4924daa02cea03365e1" ON "public"."members" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_df5675dc1172ee80f697d7d993" ON "public"."members" ("publicationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1d9ffce050312fb7c0e7a212dc" ON "public"."members" ("verificationToken") `);
        await queryRunner.query(`CREATE TABLE "public"."sessions" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "expires" TIMESTAMP WITH TIME ZONE NOT NULL, "session_token" character varying NOT NULL, "access_token" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0b14e7e9a1db4f630dc08380099" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_60108248fbd0b3df85abbd7b66" ON "public"."sessions" ("session_token") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c65c204f133bdef47a98b0a957" ON "public"."sessions" ("access_token") `);
        await queryRunner.query(`CREATE TABLE "public"."verification_requests" ("id" SERIAL NOT NULL, "identifier" character varying NOT NULL, "token" character varying NOT NULL, "expires" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_79076f1bab567e194f1763cd4b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_19d052fcf5cdd69fada0c9d8c3" ON "public"."verification_requests" ("token") `);
        await queryRunner.query(`ALTER TABLE "public"."publications" ADD CONSTRAINT "FK_73c05f8ab7bcab704091a7ef147" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."posts" ADD CONSTRAINT "FK_d8608f843180d024cd544850868" FOREIGN KEY ("publicationId") REFERENCES "public"."publications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."posts" DROP CONSTRAINT "FK_d8608f843180d024cd544850868"`);
        await queryRunner.query(`ALTER TABLE "public"."publications" DROP CONSTRAINT "FK_73c05f8ab7bcab704091a7ef147"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_19d052fcf5cdd69fada0c9d8c3"`);
        await queryRunner.query(`DROP TABLE "public"."verification_requests"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c65c204f133bdef47a98b0a957"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_60108248fbd0b3df85abbd7b66"`);
        await queryRunner.query(`DROP TABLE "public"."sessions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1d9ffce050312fb7c0e7a212dc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_df5675dc1172ee80f697d7d993"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0255c8c4924daa02cea03365e1"`);
        await queryRunner.query(`DROP TABLE "public"."members"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_96e061cadcbc5f66636236bd15"`);
        await queryRunner.query(`DROP TABLE "public"."posts"`);
        await queryRunner.query(`DROP TABLE "public"."publications"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_12ffa5c867f6bb71e2690a526c"`);
        await queryRunner.query(`DROP TABLE "public"."users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_295f09de7bcff45388d4525849"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0f28e47352cb12dd77afef2f49"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ba411186708c0e0fdb6df3a783"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ea1b53d5c2b341272169ee5f20"`);
        await queryRunner.query(`DROP TABLE "public"."accounts"`);
    }

}
