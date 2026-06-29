exports.up = function(knex) {
  return knex.schema.createTable('background_checks', (table) => {
    table.uuid('background_check_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.uuid('candidate_id').nullable()
    table.text('background_check_note').nullable()
    table.text('file_attachment').nullable()
    table.string('background_check_status').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.uuid('created_by').nullable()
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.uuid('updated_by').nullable()
    table.timestamp('deleted_at').nullable()
    table.uuid('deleted_by').nullable()
    table.boolean('is_delete').defaultTo(false)

    table.index(['deleted_at'], 'idx_background_checks_deleted_at')
    table.index(['created_at'], 'idx_background_checks_created_at')
  })
}

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('background_checks')
}
