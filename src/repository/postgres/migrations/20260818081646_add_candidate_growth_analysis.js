/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('candidates', (table) => {
    table.jsonb('candidate_growth_analysis').nullable(); // hasil analisa CV (growth mindset, SIAH, logical thinking, dll) dari n8n
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('candidates', (table) => {
    table.dropColumn('candidate_growth_analysis');
  });
};
