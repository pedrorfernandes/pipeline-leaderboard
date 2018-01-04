import * as Jenkins from 'jenkins';
import * as Queue from 'promise-queue';

const config = require('../../config/jenkins.config.json');
const MAX_CONCURRENT_REQUESTS = 1;
const MAX_IN_QUEUE = Infinity;
const DELAY_BETWEEN_REQUESTS = 500;
const requestQueue = new Queue(MAX_CONCURRENT_REQUESTS, MAX_IN_QUEUE);

function getInstance(host = config.host, user = config.username, pass = config.password, protocol = config.protocol) {
    const url = `${protocol}://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${encodeURIComponent(host)}/`;

    return Jenkins({ baseUrl: url, promisify: true });
}

function delayPromise (duration) {
    return function () {
        return new Promise((resolve, reject) => setTimeout(resolve, duration));
    };
};

const jenkinsInstance = getInstance();

const jenkinsInstanceWithQueue = {
    job: {
        get: (name: string): Promise<Jenkins.Job>  => {
            return requestQueue
                .add(delayPromise(DELAY_BETWEEN_REQUESTS))
                .then(() => jenkinsInstance.job.get(name));
        }
    },
    build: {
        get: (name: string, number: number): Promise<Jenkins.Build>  => {
            return requestQueue
                .add(delayPromise(DELAY_BETWEEN_REQUESTS))
                .then(() => jenkinsInstance.build.get(name, number));
        }
    },
    testReport: {
        get: (name: string, number: number): Promise<Jenkins.TestReport> => {
            return requestQueue
                .add(delayPromise(DELAY_BETWEEN_REQUESTS))
                .then(() => jenkinsInstance.testReport.get(name, number));
        }
    }
};

export {
    jenkinsInstanceWithQueue as jenkinsInstance
};
