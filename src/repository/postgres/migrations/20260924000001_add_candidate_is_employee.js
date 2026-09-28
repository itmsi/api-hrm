/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('candidates', (table) => {
    table.boolean('is_employee').notNullable().defaultTo(false); // penanda kandidat sudah menjadi karyawan
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('candidates', (table) => {
    table.dropColumn('is_employee');
  });
};
