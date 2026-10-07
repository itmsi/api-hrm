const masterQuestionsSchema = {
  MasterQuestion: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "6f6c4d1d-4b90-41b8-90c5-6d2336f3f2a1",
      },
      question_id: {
        type: "string",
        nullable: true,
        example: "Ceritakan tentang diri Anda.",
      },
      question_en: {
        type: "string",
        nullable: true,
        example: "Tell me about yourself.",
      },
      question_cn: {
        type: "string",
        nullable: true,
        example: "请介绍一下你自己。",
      },
      focus_assessment: {
        type: "string",
        nullable: true,
        example: "Communication",
      },
      step: { type: "string", nullable: true, example: "1" },
      created_at: {
        type: "string",
        format: "date-time",
        example: "2026-10-06T08:00:00.000Z",
      },
      created_by: { type: "string", format: "uuid", nullable: true },
      created_by_name: { type: "string", nullable: true, example: "Admin HR" },
      updated_at: {
        type: "string",
        format: "date-time",
        example: "2026-10-06T08:00:00.000Z",
      },
      updated_by: { type: "string", format: "uuid", nullable: true },
      updated_by_name: { type: "string", nullable: true, example: "Admin HR" },
      deleted_at: { type: "string", format: "date-time", nullable: true },
      deleted_by: { type: "string", format: "uuid", nullable: true },
      is_delete: { type: "boolean", example: false },
    },
  },
  MasterQuestionInput: {
    type: "object",
    properties: {
      question_id: {
        type: "string",
        nullable: true,
        example: "Ceritakan tentang diri Anda.",
      },
      question_en: {
        type: "string",
        nullable: true,
        example: "Tell me about yourself.",
      },
      question_cn: {
        type: "string",
        nullable: true,
        example: "请介绍一下你自己。",
      },
      focus_assessment: {
        type: "string",
        nullable: true,
        maxLength: 255,
        example: "Communication",
      },
      step: { type: "string", nullable: true, maxLength: 255, example: "1" },
    },
  },
};

module.exports = masterQuestionsSchema;
