import * as SlackBot from 'slackbots';
import { storedTestCaseObservable } from './storage-streams';
import { StoredTestCase } from '../../common/models/src/stored-test-case';
import { StoredJob } from '../../common/models/src/stored-job';
import { StoredBuild } from '../../common/models/src/stored-build';
import { getTestCasesWithFailureAboveThreshold } from '../../common/queries/src/test-case';
import * as Rx from '@reactivex/rxjs';

class SlackConfig {
    name: string;
    token: string;
    channel: string;
    warnings: {
        failed: [{
            maxTestCaseFailureCount: number,
            totalProductBuilds: number
        }]
    };
}

const config: SlackConfig = require('../../config/slack.config.json');

const bot = new SlackBot({
    token: config.token,
    name: config.name
});

const messageObservable = storedTestCaseObservable
    .flatMap(
        () => config.warnings.failed,
        (input, warningConfig) => Object.assign({}, input, { warningConfig })
    )
    .flatMap(
        function ({ upstreamJob, upstreamBuild, testCases, warningConfig }) {
            const upstreamJobId = StoredJob.toId(upstreamJob);
            const failedTestCaseIds = testCases
                .filter(({ testCase }) => testCase.status === 'REGRESSION' || testCase.status === 'FAILED')
                .map(({ testCase }) => StoredTestCase.toId(testCase));

            return Rx.Observable
                .fromPromise(getTestCasesWithFailureAboveThreshold(
                    upstreamJobId,
                    upstreamBuild.number,
                    warningConfig.totalProductBuilds,
                    warningConfig.maxTestCaseFailureCount,
                    failedTestCaseIds
                ))
                .flatMap((results) => {
                    return results.map(({ count, testCaseId }) => ({
                        count,
                        warningConfig,
                        upstreamJob,
                        testCase: testCases
                            .find(({ testCase }) => StoredTestCase.toId(testCase) === parseInt(testCaseId))
                    }));

                    }
                );
        }
    )
    .map(function ({ testCase, count, warningConfig, upstreamJob}) {
        console.log('sending message');
        return bot
            .postMessageToChannel(config.channel,
                `The test case ${StoredTestCase.getExternalId(testCase.testCase)}
                has failed ${count} times
                in the last ${warningConfig.totalProductBuilds} builds of ${upstreamJob.name}`
            )
            .then((message) => console.log(`message was posted to ${config.channel}, got ${message}`))
            .catch((error) => console.log(error));
    });


export {
    messageObservable
}