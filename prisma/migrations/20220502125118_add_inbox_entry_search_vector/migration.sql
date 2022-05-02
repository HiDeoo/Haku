-- AlterTable
ALTER TABLE
  "InboxEntry"
ADD
  COLUMN "searchVector" TSVECTOR GENERATED ALWAYS AS (
    setweight(
      to_tsvector(
        'simple',
        coalesce(text, '')
      ),
      'A'
    )
  ) STORED;

-- CreateIndex
CREATE INDEX "InboxEntry_searchVector_index" ON "InboxEntry" USING GIN ("searchVector");
