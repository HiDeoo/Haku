-- AlterTable
ALTER TABLE
  "Todo"
ADD
  COLUMN "searchVector" TSVECTOR GENERATED ALWAYS AS (
    setweight(
      to_tsvector(
        'simple',
        coalesce(name, '')
      ),
      'A'
    )
  ) STORED;

-- CreateIndex
CREATE INDEX "Todo_searchVector_index" ON "Todo" USING GIN ("searchVector");
