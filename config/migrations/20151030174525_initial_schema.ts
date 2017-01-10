exports.up = (knex, Promise) => {
  return knex.schema
    .createTable('Job', (table) => {
      table.biginteger('parentId').unsigned().references('jobId').inTable('Job');
      table.string('name');
      table.json('json');
      table.primary(['name']);
    })
    .createTable('JobBuild', (table) => {
      table.biginteger('jobId').unsigned().references('jobId').inTable('Job');
      table.biginteger('parentBuildId').unsigned().references('parentBuildId').inTable('JobBuild');
      table.integer('number');
      table.json('buildJson');
      table.json('testReportJson');
      table.primary(['jobId', 'number']);
    })
    .createTable('TestCase', (table) => {
      table.bigincrements('testCaseId').primary();
      table.biginteger('jobId').unsigned().references('jobId').inTable('Job');
      table.string('testId').index();
      table.string('name').index().unique();
      table.string('suite');
    })
    .createTable('TestCase_JobBuild', (table) => {
      table.biginteger('testCaseId').unsigned().references('testCaseId').inTable('TestCase');
      table.biginteger('jobBuildId').unsigned().references('jobBuildId').inTable('JobBuild');
      table.timestamp('timestamp');
      table.float('duration');
      table.string('status');
      table.boolean('skipped');
      table.json('json');
      table.primary(['testCaseId', 'jobBuildId']);
    });
};

exports.down = (knex, Promise) => {
  return knex.schema
    .dropTableIfExists('TestCase_JobBuild')
    .dropTableIfExists('TestCase')
    .dropTableIfExists('JobBuild')
    .dropTableIfExists('Job')
};