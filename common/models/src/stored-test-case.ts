import { dbInstance } from '../../connections/database';
import { stringToHash } from './to-hash';
import { upsertItems } from '../../knex/upsert';
import { StoredJob } from './stored-job';
import { StoredBuild } from './stored-build';
import * as lodash from 'lodash';

const testCaseExternalIdRegex = /\[(TC\d+|\d+)\]/;

class StoredTestCase {

    static getExternalId(testCase: JenkinsTestCase) {
        const externalId = lodash.get(testCaseExternalIdRegex.exec(testCase.name), 0, null);

        return externalId
            ? externalId
            : testCase.name;
    }

    static toId(testCase: JenkinsTestCase) {
        return testCase
            ? stringToHash(`${testCase.className}${testCase.name}`)
            : undefined;
    }

    static save(
        job: JenkinsJob,
        upstreamJob: JenkinsJob,
        build: JenkinsBuild,
        testCases: {
            testCase: JenkinsTestCase;
            suite: JenkinsTestSuite;
        }[]
    ) {
        const storeTestCase = (testCase: JenkinsTestCase) => {
            return upsertItems(dbInstance, 'TestCase', 'testCaseId', {
                testCaseId: StoredTestCase.toId(testCase),
                jobId: StoredJob.toId(job),
                externalId: StoredTestCase.getExternalId(testCase),
                name: testCase.name,
                suite: testCase.className
            });
        };

        const connectTestCaseToBuild = (testCase: JenkinsTestCase, suite: JenkinsTestSuite) => {
            return upsertItems(dbInstance, 'TestCase_JobBuild', ['testCaseId', 'buildId'], {
                testCaseId: StoredTestCase.toId(testCase),
                buildId: StoredBuild.toId(job, build),
                timestamp: suite.timestamp,
                duration: testCase.duration,
                suiteDuration: suite.duration,
                status: testCase.status,
                skipped: testCase.skipped,
                json: testCase
            });
        };

        return Promise.all(testCases.map(({ testCase }) => storeTestCase(testCase)))
            .then(() =>
                Promise.all(testCases.map(({ testCase, suite }) => connectTestCaseToBuild(testCase, suite)))
            );
    }
}

export { StoredTestCase };