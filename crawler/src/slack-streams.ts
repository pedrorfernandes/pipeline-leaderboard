import * as SlackBot from 'slackbots';
import { storedTestCaseObservable } from './storage-streams';
import { StoredTestCase } from '../../common/models/src/stored-test-case';
import { StoredJob } from '../../common/models/src/stored-job';
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
        function ({ storedUpstreamJob, storedUpstreamBuild, storedTestCases, warningConfig }) {

            const failedTestCaseIds = storedTestCases
                .filter((testCase) => testCase.status === 'REGRESSION' || testCase.status === 'FAILED')
                .map((testCase) => testCase.testCaseId);

            return Rx.Observable
                .fromPromise(getTestCasesWithFailureAboveThreshold(
                    storedUpstreamJob.jobId,
                    storedUpstreamBuild.number,
                    warningConfig.totalProductBuilds,
                    warningConfig.maxTestCaseFailureCount,
                    failedTestCaseIds
                ))
                .flatMap((results) => {
                    return results.map(({ count, testCaseId }) => ({
                        count,
                        warningConfig,
                        storedUpstreamJob,
                        testCase: storedTestCases.find((testCase) => testCase.testCaseId === testCaseId)
                    }));
                });
        }
    )
    .flatMap(function ({ testCase, count, warningConfig, storedUpstreamJob}) {
        const message = `The test case \`${testCase.name}\`` +
                ` has failed ${count} times` +
                ` in the last ${warningConfig.totalProductBuilds}` +
                ` builds of ${storedUpstreamJob.name}`;

        return Rx.Observable
            .fromPromise(bot.postMessageToChannel(config.channel, message))
            .mapTo(message);
    });

export {
    messageObservable
}