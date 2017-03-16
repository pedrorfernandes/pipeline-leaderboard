import { dbInstance } from '../../connections/database';

function getTestCasesWithFailureAboveThreshold(
    upstreamJobId,
    upstreamBuildNumber,
    numberOfUpstreamBuilds,
    maxTestCaseFailureCount,
    testCaseIds
): Promise<{ count: string, testCaseId: string }[]> {
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
        .select('testCaseId');
}

export {
    getTestCasesWithFailureAboveThreshold
}