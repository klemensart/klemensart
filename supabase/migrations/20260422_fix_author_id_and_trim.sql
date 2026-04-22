-- 1. Trim trailing spaces from author and slug fields
UPDATE articles SET author = TRIM(author) WHERE author != TRIM(author);
UPDATE articles SET slug   = TRIM(slug)   WHERE slug   != TRIM(slug);

-- 2. Auto-link author_id for articles where author name matches people.name
UPDATE articles a
SET author_id = p.id
FROM people p
WHERE a.author_id IS NULL
  AND TRIM(a.author) = p.name;

-- 3. Case-insensitive match for KLEMENS → Klemens
UPDATE articles a
SET author_id = p.id
FROM people p
WHERE a.author_id IS NULL
  AND LOWER(TRIM(a.author)) = LOWER(p.name);
