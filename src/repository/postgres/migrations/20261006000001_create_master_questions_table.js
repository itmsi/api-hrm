exports.up = function(knex) {
  return knex.schema.createTable('master_questions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.text('question_id').nullable()
    table.text('question_en').nullable()
    table.text('question_cn').nullable()
    table.string('focus_assessment').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.uuid('created_by').nullable()
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.uuid('updated_by').nullable()
    table.timestamp('deleted_at').nullable()
    table.uuid('deleted_by').nullable()
    table.boolean('is_delete').defaultTo(false)

    table.index(['deleted_at'], 'idx_master_questions_deleted_at')
    table.index(['created_at'], 'idx_master_questions_created_at')
  })
}

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('master_questions')
}
