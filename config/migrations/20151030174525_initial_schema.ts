exports.up = (knex, Promise) => {
  return knex.schema
    .createTable('Job', (table) => {
      table.biginteger('jobId').unsigned().primary();
      table.biginteger('upstreamId').references('jobId').inTable('Job');
      table.json('json');
      table.string('name');
    })
    .createTable('JobBuild', (table) => {
      table.biginteger('buildId').unsigned().primary();
      table.biginteger('jobId').references('jobId').inTable('Job');
      table.stribigintegerng('upstreamBuildId').references('buildId').inTable('JobBuild');
      table.integer('number');
      table.json('buildJson');
      table.json('testReportJson');
    })
    .createTable('TestCase', (table) => {
      table.biginteger('testCaseId').unsigned().primary();
      table.biginteger('jobId').references('jobId').inTable('Job');
      table.string('testId').index();
      table.string('name').index();
      table.string('suite');
    })
    .createTable('TestCase_JobBuild', (table) => {
      table.string('testCaseId').references('testCaseId').inTable('TestCase');
      table.string('jobBuildId').references('jobBuildId').inTable('JobBuild');
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