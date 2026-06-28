exports.up = function(knex) {
  return knex.schema.createTable('schedule_interviews', (table) => {
    table.uuid('schedule_interview_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.uuid('candidate_id').nullable()
    table.jsonb('assign_role').nullable()
    table.date('schedule_interview_date').nullable()
    table.time('schedule_interview_time').nullable()
    table.string('schedule_interview_duration').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.uuid('created_by').nullable()
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.uuid('updated_by').nullable()
    table.timestamp('deleted_at').nullable()
    table.uuid('deleted_by').nullable()
    table.boolean('is_delete').defaultTo(false)

    table.index(['deleted_at'], 'idx_schedule_interviews_deleted_at')
    table.index(['created_at'], 'idx_schedule_interviews_created_at')
  })
}

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('schedule_interviews')
}
