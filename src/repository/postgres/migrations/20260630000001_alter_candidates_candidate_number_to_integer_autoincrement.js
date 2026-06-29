/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw(`
    UPDATE candidates
    SET candidate_number = NULLIF(regexp_replace(candidate_number::text, '[^0-9]', '', 'g'), '')::integer
    WHERE candidate_number IS NOT NULL
  `)

  await knex.raw(`
    ALTER TABLE candidates
    ALTER COLUMN candidate_number TYPE integer
    USING NULLIF(candidate_number::text, '')::integer
  `)

  await knex.raw(`
    CREATE SEQUENCE IF NOT EXISTS candidates_candidate_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
  `)

  await knex.raw(`
    ALTER TABLE candidates
    ALTER COLUMN candidate_number SET DEFAULT nextval('candidates_candidate_number_seq'::regclass)
  `)

  await knex.raw(`
    SELECT setval('candidates_candidate_number_seq', COALESCE((SELECT MAX(candidate_number) FROM candidates), 0) + 1, false)
  `)

  await knex.raw(`
    ALTER SEQUENCE candidates_candidate_number_seq OWNED BY candidates.candidate_number
  `)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.raw(`
    ALTER TABLE candidates
    ALTER COLUMN candidate_number TYPE varchar(255)
    USING candidate_number::varchar
  `)

  await knex.raw(`
    DROP SEQUENCE IF EXISTS candidates_candidate_number_seq
  `)
}

/**
 * reset auto increment sequence to the next available number after a manual update of candidate_number

 ALTER SEQUENCE candidates_candidate_number_seq RESTART WITH 1;
 */
