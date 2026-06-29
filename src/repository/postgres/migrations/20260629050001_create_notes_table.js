exports.up = function(knex) {
  return knex.schema.createTable('notes', (table) => {
    table.uuid('note_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.uuid('candidate_id').nullable()
    table.text('notes').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.uuid('created_by').nullable()
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.uuid('updated_by').nullable()
    table.timestamp('deleted_at').nullable()
    table.uuid('deleted_by').nullable()
    table.boolean('is_delete').defaultTo(false)

    table.index(['deleted_at'], 'idx_notes_deleted_at')
    table.index(['created_at'], 'idx_notes_created_at')
  })
}

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('notes')
}
