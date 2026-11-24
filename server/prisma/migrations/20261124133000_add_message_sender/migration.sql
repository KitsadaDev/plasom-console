CREATE TYPE "MessageSender" AS ENUM ('CUSTOMER', 'BOT', 'STAFF');

ALTER TABLE "Message"
ADD COLUMN "sender" "MessageSender" NOT NULL DEFAULT 'CUSTOMER';

UPDATE "Message"
SET "sender" = 'STAFF'
WHERE "fromStaff" = true;
