-- AlterTable
ALTER TABLE "players" ADD COLUMN     "role" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "line_sources" ADD COLUMN     "menu_keywords" TEXT[] DEFAULT ARRAY['麻將', '德州']::TEXT[];
