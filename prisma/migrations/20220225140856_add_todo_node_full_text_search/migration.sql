-- AlterTable
ALTER TABLE
  "TodoNode"
ADD
  COLUMN "searchVector" TSVECTOR GENERATED ALWAYS AS (
    setweight(
      to_tsvector(
        'simple',
        coalesce(content, '')
      ),
      'B'
    ) || setweight(
      to_tsvector(
        'simple',
        coalesce("noteText", '')
      ),
      'C'
    )
  ) STORED;

-- CreateIndex
CREATE INDEX "TodoNode_searchVector_index" ON "TodoNode" USING GIN ("searchVector");
