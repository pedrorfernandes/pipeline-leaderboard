exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('Job', function (table) {
      table.bigincrements('jobId').primary();
      table.string('name').unique();
      table.json('json');
    })
    .createTable('Product', function(table){
      table.bigincrements('productId').primary();
      table.string('name').unique();
    })
    .createTable('ProductBuild', function(table){
      table.bigincrements('productBuildId').primary();
      table.biginteger('productId').unsigned().references('productId').inTable('Product');
      table.integer('number').index();
      table.unique(['productId', 'number']);
    })
    .createTable('JobBuild', function (table) {
      table.bigincrements('jobBuildId').primary();
      table.biginteger('jobId').unsigned().references('jobId').inTable('Job');
      table.biginteger('productBuildId').unsigned().references('productBuildId').inTable('ProductBuild');
      table.integer('number');
      table.json('buildJson');
      table.json('testReportJson');
      table.unique(['jobId', 'number']);
    })
    .createTable('TestCase', function(table) {
      table.bigincrements('testCaseId').primary();
      table.biginteger('jobId').unsigned().references('jobId').inTable('Job');
      table.string('testId').index();
      table.string('name').index().unique();
      table.string('suite');
    })
    .createTable('TestCase_JobBuild',function(table) {
      table.biginteger('testCaseId').unsigned().references('testCaseId').inTable('TestCase');
      table.biginteger('jobBuildId').unsigned().references('jobBuildId').inTable('JobBuild');
      table.timestamp('timestamp');
      table.float('duration');
      table.string('status');
      table.boolean('skipped');
      table.json('json');
      table.primary(['testCaseId', 'jobBuildId']);
    })
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists('TestCase_JobBuild')
    .dropTableIfExists('TestCase')
    .dropTableIfExists('JobBuild')
    .dropTableIfExists('ProductBuild')
    .dropTableIfExists('Job')
    .dropTableIfExists('Product')
};