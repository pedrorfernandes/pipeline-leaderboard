exports.up = (knex, Promise) => {
  return knex.schema
    .createTable('Job', (table) => {
      table.biginteger('jobId').primary();
      table.biginteger('upstreamJobId').references('jobId').inTable('Job');
      table.json('json');
      table.string('name');
    })
    .createTable('JobBuild', (table) => {
      table.biginteger('buildId').primary();
      table.biginteger('jobId').references('jobId').inTable('Job');
      table.biginteger('upstreamBuildId').references('buildId').inTable('JobBuild');
      table.integer('number');
      table.json('buildJson');
      table.json('testReportJson');
    })
    .createTable('TestCase', (table) => {
      table.biginteger('testCaseId').primary();
      table.biginteger('jobId').references('jobId').inTable('Job');
      table.string('testId').index();
      table.string('name').index();
      table.string('suite');
    })
    .createTable('TestCase_JobBuild', (table) => {
      table.biginteger('testCaseId').references('testCaseId').inTable('TestCase');
      table.biginteger('buildId').references('buildId').inTable('JobBuild');
      table.timestamp('timestamp');
      table.float('duration');
      table.string('status');
      table.boolean('skipped');
      table.json('json');
      table.primary(['testCaseId', 'buildId']);
    });
};

exports.down = (knex, Promise) => {
  return knex.schema
    .dropTableIfExists('TestCase_JobBuild')
    .dropTableIfExists('TestCase')
    .dropTableIfExists('JobBuild')
    .dropTableIfExists('Job');
};