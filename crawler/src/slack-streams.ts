import * as SlackBot from 'slackbots';
import { storedTestCaseObservable } from './storage-streams';
import { StoredTestCase } from '../../common/models/src/stored-test-case';

const config = require('../../config/slack.config.json');

const bot = new SlackBot({
    token: config.token,
    name: config.name
});

const messageObservable =
    storedTestCaseObservable
        .filter(({ testCase }) => testCase.status === 'REGRESSION')
        .map(
        function ({ testCase, suite }) {
            const externalId = StoredTestCase.getExternalId(testCase);

            return bot
                .postMessageToChannel(config.channel, `The test case ${externalId} has failed miserably`)
                .catch((error) => console.log(error));
        },
        function (error) {
            console.log(error);
        }
        );


export {
    messageObservable
}