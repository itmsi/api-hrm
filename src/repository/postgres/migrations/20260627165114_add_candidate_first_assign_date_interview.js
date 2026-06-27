/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('candidates', (table) => {
    table.jsonb('schedule_interview').nullable(); //nanti isinya assign_role, schedule_interview_date, schedule_interview_time, schedule_interview_duration
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('candidates', (table) => {
    table.dropColumn('schedule_interview');
  });
};
