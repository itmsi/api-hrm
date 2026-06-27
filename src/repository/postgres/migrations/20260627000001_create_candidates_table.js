exports.up = function(knex) {
  return knex.schema.createTable('candidates', (table) => {
    table.uuid('candidate_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.uuid('company_id').nullable()
    table.uuid('department_id').nullable()
    table.uuid('title_id').nullable()
    table.string('candidate_number').nullable()
    table.string('candidate_name').nullable()
    table.string('candidate_email').nullable()
    table.string('candidate_phone').nullable()
    table.string('candidate_religion').nullable()
    table.string('candidate_gender').nullable()
    table.string('candidate_marital_status').nullable()
    table.integer('candidate_age').nullable()
    table.date('candidate_date_birth').nullable()
    table.string('candidate_nationality').nullable()
    table.string('candidate_city').nullable()
    table.string('candidate_state').nullable()
    table.string('candidate_country').nullable()
    table.text('candidate_address').nullable()
    table.text('candidate_foto').nullable()
    table.text('candidate_resume').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.uuid('created_by').nullable()
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.uuid('updated_by').nullable()
    table.timestamp('deleted_at').nullable()
    table.uuid('deleted_by').nullable()
    table.boolean('is_delete').defaultTo(false)

    table.index(['deleted_at'], 'idx_candidates_deleted_at')
    table.index(['created_at'], 'idx_candidates_created_at')
  })
}

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('candidates')
}
