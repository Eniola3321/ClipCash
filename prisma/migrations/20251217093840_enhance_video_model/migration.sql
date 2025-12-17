-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "description" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "fileSize" BIGINT,
ADD COLUMN     "processingError" TEXT,
ADD COLUMN     "sourceType" TEXT NOT NULL DEFAULT 'youtube',
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "title" TEXT,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "Video_userId_idx" ON "Video"("userId");

-- CreateIndex
CREATE INDEX "Video_status_idx" ON "Video"("status");
