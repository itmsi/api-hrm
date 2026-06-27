/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('candidates', (table) => {
    table.uuid('group_id').nullable();
    table.string('candidate_status', 255).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('candidates', (table) => {
    table.dropColumn('group_id');
    table.dropColumn('candidate_status');
  });
};
