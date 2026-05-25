/*
  Warnings:

  - The values [SUBSCRIPTION_GENERATED] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('ORDER_UPDATE', 'SUBSCRIPTION_UPDATE', 'PAYMENT_ALERT', 'PRODUCT_ISSUE', 'NEW_TASK', 'ACCOUNT_UPDATE', 'STATUS_CHANGE');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;
