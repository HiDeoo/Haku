-- AlterTable
ALTER TABLE
  "Note"
ADD
  COLUMN "searchVector" TSVECTOR GENERATED ALWAYS AS (
    setweight(
      to_tsvector(
        'simple',
        coalesce(name, '')
      ),
      'A'
    ) || setweight(
      to_tsvector(
        'simple',
        coalesce(text, '')
      ),
      'B'
    )
  ) STORED;

-- CreateIndex
CREATE INDEX "Note_searchVector_index" ON "Note" USING GIN ("searchVector");
