-- 1. Create enum type
CREATE TYPE "MessageSender" AS ENUM ('user', 'ai');

-- 2. Normalize existing data
UPDATE "Message"
SET "sender" = 'user'
WHERE "sender" IS NULL
   OR "sender" NOT IN ('user', 'ai');

-- 3. Convert column type safely
ALTER TABLE "Message"
ALTER COLUMN "sender" TYPE "MessageSender"
USING "sender"::"MessageSender";
