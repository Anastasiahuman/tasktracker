-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('DESIGN', 'REQUIREMENTS', 'RESEARCH', 'DEVELOPMENT', 'TESTING', 'PUBLICATION');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "category" "TaskCategory";





