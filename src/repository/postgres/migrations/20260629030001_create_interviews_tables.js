exports.up = function(knex) {
  return knex.schema
    .createTable('interviews', (table) => {
      table.uuid('interview_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
      table.uuid('schedule_interview_id').nullable()
      table.uuid('assigned_id').nullable()
      table.string('company_value').nullable()
      table.text('comment').nullable()
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.uuid('created_by').nullable()
      table.timestamp('updated_at').defaultTo(knex.fn.now())
      table.uuid('updated_by').nullable()
      table.timestamp('deleted_at').nullable()
      table.uuid('deleted_by').nullable()
      table.boolean('is_delete').defaultTo(false)

      table.index(['deleted_at'], 'idx_interviews_deleted_at')
      table.index(['created_at'], 'idx_interviews_created_at')
    })
    .createTable('detail_interviews', (table) => {
      table.uuid('detail_interview_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
      table.uuid('interview_id').nullable()
      table.string('aspect').nullable()
      table.text('question').nullable()
      table.text('answer').nullable()
      table.string('score').defaultTo('0')
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.uuid('created_by').nullable()
      table.timestamp('updated_at').defaultTo(knex.fn.now())
      table.uuid('updated_by').nullable()
      table.timestamp('deleted_at').nullable()
      table.uuid('deleted_by').nullable()
      table.boolean('is_delete').defaultTo(false)

      table.index(['deleted_at'], 'idx_detail_interviews_deleted_at')
      table.index(['created_at'], 'idx_detail_interviews_created_at')
    })
}

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('detail_interviews')
    .dropTableIfExists('interviews')
}
