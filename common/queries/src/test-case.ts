import { dbInstance } from '../../connections/database';
import * as Jenkins from 'jenkins';

function getTestCasesWithFailureAboveThreshold(
    upstreamJobId,
    upstreamBuildNumber,
    numberOfUpstreamBuilds,
    maxTestCaseFailureCount,
    testCaseIds
): Promise<{ count: number, testCaseId: number }[]> {
    let lastNUpstreamBuildIds = dbInstance('JobBuild')
        .where({ jobId: upstreamJobId })
        .whereBetween('number', [upstreamBuildNumber - numberOfUpstreamBuilds, upstreamBuildNumber])
        .select('buildId');

    let lastNbuildIds = dbInstance('JobBuild')
        .whereIn('upstreamBuildId', lastNUpstreamBuildIds)
        .select('buildId');

    return dbInstance('TestCase_JobBuild')
        .count('*')
        .groupBy('testCaseId')
        .whereIn('buildId', lastNbuildIds)
        .whereIn('status', ['REGRESSION', 'FAILED'])
        .whereIn('testCaseId', testCaseIds)
        .havingRaw('count(*) > ?', maxTestCaseFailureCount)
        .select('testCaseId')
        .then((results) =>
            results.map( ({count, testCaseId}) => ({ count: parseInt(count), testCaseId: parseInt(testCaseId) }) )
        );
}

function getTestReport(name: string, number: number): Promise<Jenkins.TestReport> {
    return dbInstance('JobBuild')
        .innerJoin('Job', 'JobBuild.jobId', 'Job.jobId')
        .where({ name, number })
        .then(([{ testReportJson }]) => testReportJson);
}

export {
    getTestCasesWithFailureAboveThreshold,
    getTestReport
}