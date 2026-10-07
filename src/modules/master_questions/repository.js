const { pgCore } = require("../../config/database");
const {
  parseStandardQuery,
  applyStandardFilters,
  buildCountQuery,
  formatSimplePaginatedResponse,
} = require("../../utils/standard_query");

const TABLE_NAME = "master_questions";
const SELECT_COLUMNS = [
  `${TABLE_NAME}.id`,
  `${TABLE_NAME}.question_id`,
  `${TABLE_NAME}.question_en`,
  `${TABLE_NAME}.question_cn`,
  `${TABLE_NAME}.focus_assessment`,
  `${TABLE_NAME}.step`,
  `${TABLE_NAME}.created_at`,
  `${TABLE_NAME}.created_by`,
  `${TABLE_NAME}.updated_at`,
  `${TABLE_NAME}.updated_by`,
  `${TABLE_NAME}.deleted_at`,
  `${TABLE_NAME}.deleted_by`,
  `${TABLE_NAME}.is_delete`,
  "created_employee.employee_name as created_by_name",
  "updated_employee.employee_name as updated_by_name",
];
const ALLOWED_SORT_COLUMNS = [
  "created_at",
  "updated_at",
  "focus_assessment",
  "step",
];
const SEARCHABLE_COLUMNS = [
  "question_id",
  "question_en",
  "question_cn",
  "focus_assessment",
  "step",
].map((column) => `${TABLE_NAME}.${column}`);

const baseSelectQuery = () =>
  pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .leftJoin(
      "gate_sso_employees as created_employee",
      "created_employee.employee_id",
      `${TABLE_NAME}.created_by`,
    )
    .leftJoin(
      "gate_sso_employees as updated_employee",
      "updated_employee.employee_id",
      `${TABLE_NAME}.updated_by`,
    );

const findAll = async (params = {}) => {
  const queryParams = parseStandardQuery(
    { body: params },
    {
      allowedColumns: ALLOWED_SORT_COLUMNS,
      defaultOrder: ["created_at", "desc"],
      searchableColumns: SEARCHABLE_COLUMNS,
      allowedFilters: [],
      fromBody: true,
    },
  );

  // Prefix kolom sort dengan nama tabel agar tidak ambigu dengan tabel join
  queryParams.sorting.sortBy = `${TABLE_NAME}.${queryParams.sorting.sortBy}`;

  const baseQuery = baseSelectQuery().where(`${TABLE_NAME}.deleted_at`, null);

  const data = await applyStandardFilters(baseQuery, queryParams);

  const totalResult = await buildCountQuery(
    pgCore(TABLE_NAME).where({ deleted_at: null }),
    queryParams,
  )
    .count("id as count")
    .first();
  const total = parseInt(totalResult?.count || 0, 10);

  return formatSimplePaginatedResponse(data, queryParams.pagination, total);
};

const findById = async (id) => {
  return await baseSelectQuery()
    .where(`${TABLE_NAME}.id`, id)
    .where(`${TABLE_NAME}.deleted_at`, null)
    .first();
};

const create = async (data = {}) => {
  const [inserted] = await pgCore(TABLE_NAME)
    .insert({
      ...data,
      created_at: pgCore.fn.now(),
      updated_at: pgCore.fn.now(),
      is_delete: false,
    })
    .returning("id");
  return await findById(inserted.id);
};

const update = async (id, data = {}) => {
  const [updated] = await pgCore(TABLE_NAME)
    .where({ id, deleted_at: null })
    .update({
      ...data,
      updated_at: pgCore.fn.now(),
    })
    .returning("id");

  if (!updated?.id) return null;
  return await findById(updated.id);
};

const remove = async (id, deletedBy) => {
  const [deleted] = await pgCore(TABLE_NAME)
    .where({ id, deleted_at: null })
    .update({
      deleted_at: pgCore.fn.now(),
      deleted_by: deletedBy,
      updated_at: pgCore.fn.now(),
      is_delete: true,
    })
    .returning("id");

  return deleted || null;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
