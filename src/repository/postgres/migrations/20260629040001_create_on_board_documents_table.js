exports.up = function(knex) {
  return knex.schema.createTable('on_board_documents', (table) => {
    table.uuid('on_board_documents_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.uuid('candidate_id').nullable()
    table.string('on_board_documents_name').nullable()
    table.text('on_board_documents_file').nullable()
    table.text('on_board_documents_file_path').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.uuid('created_by').nullable()
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.uuid('updated_by').nullable()
    table.timestamp('deleted_at').nullable()
    table.uuid('deleted_by').nullable()
    table.boolean('is_delete').defaultTo(false)

    table.index(['deleted_at'], 'idx_on_board_documents_deleted_at')
    table.index(['created_at'], 'idx_on_board_documents_created_at')
  })
}

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('on_board_documents')
}
