exports.up = (knex, Promise) => {
  return knex.schema
    .createTable('Job', (table) => {
      table.string('upstreamId').references('jobId').inTable('Job');
      table.string('jobId').primary();
      table.json('json');
    })
    .createTable('JobBuild', (table) => {
      table.string('buildId').primary();
      table.string('jobId').references('jobId').inTable('Job');
      table.string('upstreamBuildId').references('buildId').inTable('JobBuild');
      table.integer('number');
      table.json('buildJson');
      table.json('testReportJson');
    })
    .createTable('TestCase', (table) => {
      table.string('testCaseId').primary();
      table.string('jobId').references('jobId').inTable('Job');
      table.string('testId').index();
      table.string('name').index();
      table.string('suite');
    })
    .createTable('TestCase_JobBuild', (table) => {
      table.string('testCaseId').unsigned().references('testCaseId').inTable('TestCase');
      table.string('jobBuildId').unsigned().references('jobBuildId').inTable('JobBuild');
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