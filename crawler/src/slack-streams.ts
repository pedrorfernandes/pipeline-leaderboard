import * as SlackBot from 'slackbots';
import { storedTestCaseObservable } from './storage-streams';
import { StoredTestCase } from '../../common/models/src/stored-test-case';
import { StoredJob } from '../../common/models/src/stored-job';
import { getTestCasesWithFailureAboveThreshold } from '../../common/queries/src/test-case';
import * as Rx from '@reactivex/rxjs';
import * as lodash from 'lodash';

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

const FIVE_MINUTES = 5 * 60 * 1000;

const messageObservable = storedTestCaseObservable
    .flatMap(
        () => config.warnings.failed,
        (input, warningConfig) => ({ ...input, warningConfig })
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
                        storedUpstreamBuild,
                        testCase: storedTestCases.find((testCase) => testCase.testCaseId === testCaseId)
                    }));
                });
        }
    )
    .bufferTime(FIVE_MINUTES)
    .flatMap(allWarnings => lodash.partition(allWarnings, ({testCase}) => testCase.testCaseId))
    .filter((failWarningsGroupedById) => failWarningsGroupedById.length > 0)
    .flatMap((failWarningsGroupedById) => {
        const [ { testCase } ] = failWarningsGroupedById;

        const failedTestsWarnings = failWarningsGroupedById
            .map(({ count, warningConfig, storedUpstreamJob, storedUpstreamBuild}) =>
                ` has failed ${count} times` +
                ` in ${warningConfig.totalProductBuilds}` +
                ` builds of ${storedUpstreamJob.name}` +
                ` (from ${warningConfig.totalProductBuilds - storedUpstreamBuild.number}` +
                ` to ${storedUpstreamBuild.number})`
            );

        const message = `\`${testCase.name}\`\n` + failedTestsWarnings.join('\n    ');

        return Rx.Observable
            .fromPromise(bot.postMessageToChannel(config.channel, message))
            .mapTo(message);
    });

export {
    messageObservable
}
