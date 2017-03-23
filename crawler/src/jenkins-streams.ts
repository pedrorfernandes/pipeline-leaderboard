import * as Rx from '@reactivex/rxjs';
import * as Jenkins from 'jenkins';
import { jenkinsInstance as jenkins } from './jenkins';
import { getUpstreamBuild } from './job-helper';
import * as lodash from 'lodash';
import { getBuilds } from '../../common/queries/src/build';
const config = require('../../config/jenkins.config.json');
const HOUR_IN_MILLISECONDS = 3600000;
const POLLING_INTERVAL = config['polling-interval-hours'] * HOUR_IN_MILLISECONDS;

const logErrorAndMapTo = (defaultValue) =>
    (error) => Rx.Observable
        .of(error)
        .do(console.error)
        .mapTo(defaultValue);

class JobConfig {
    testJob: string;
    productJob: string;
}

const configIntervalObservable: Rx.Observable<JobConfig> =
    Rx.Observable
        .timer(0, POLLING_INTERVAL)
        .flatMap(() => config.jobs)
        .share();

const jobObservable = configIntervalObservable
    .flatMap(
        function (jobConfig): Rx.Observable<[Jenkins.Job, Jenkins.Job]> {
            return Rx.Observable
                .forkJoin([
                    jenkins.job.get(jobConfig.testJob),
                    jenkins.job.get(jobConfig.productJob)
                ])
                .catch(logErrorAndMapTo([null, null]));
        },
        function returnCombined(jobConfig, [ job, upstreamJob ]) {
            return { job, upstreamJob };
        }
    )
    .filter(({ job, upstreamJob }) => !!job && !!upstreamJob)
    .share();

const buildObservable = jobObservable
    .flatMap(
        function fetchStoredBuilds({ job, upstreamJob }) {
            return Rx.Observable.fromPromise(
                getBuilds(job.name, job.builds.map(({ number }) => number))
            );
        },
        function trimAlreadyStoredBuilds({ job, upstreamJob }, builds) {
            const buildNumbers = builds.map(({number}) => number);
            job.builds = job.builds.filter(({ number }) => buildNumbers.indexOf(number) === -1);

            return { job, upstreamJob };
        }
    )
    .flatMap(
        function getBuilds({ job }): Rx.Observable<Jenkins.Build> {
            const buildPromises = job.builds.map(
                (build) => jenkins.build.get(job.name, build.number)
            );

            return Rx.Observable
                .from(buildPromises)
                .flatMap((buildPromise) => Rx.Observable.fromPromise(buildPromise))
                .catch(logErrorAndMapTo(null));
        },
        function returnCombined(input, build) {
            return Object.assign({}, input, { build });
        }
    )
    .filter(({ build }) => !!build)
    .share();

const upstreamBuildObservable = buildObservable
    .flatMap(
        function ({job, upstreamJob, build}): Rx.Observable<Jenkins.Build> {
            return Rx.Observable
                .fromPromise(
                    getUpstreamBuild(job.name, build, upstreamJob.name)
                )
                .catch(logErrorAndMapTo(null));
        },
        function returnCombined(input, upstreamBuild) {
            return Object.assign({}, input, { upstreamBuild });
        }
    )
    .filter(({ upstreamBuild }) => upstreamBuild !== null)
    .share();

const testReportObservable = upstreamBuildObservable
    .flatMap(
        function getTestReport({ job, build }): Rx.Observable<Jenkins.TestReport> {
            return Rx.Observable
                .fromPromise(
                    jenkins.testReport.get(job.name, build.number)
                )
                .catch(logErrorAndMapTo(null));
        },
        function returnCombined(input, testReport) {
            return Object.assign({}, input, { testReport });
        }
    )
    .filter(({ testReport }) => testReport !== null)
    .share();

const extractTestCases = (testReport: Jenkins.TestReport) =>
    lodash.flatMap(testReport.childReports, ({ result: { suites } }) =>
        lodash.flatMap(suites, (suite) =>
            lodash.flatMap(suite.cases, (testCase) => ({ testCase, suite }))
        )
    );

const testCasesObservable = testReportObservable
    .map(function addTestCases(input) {
        return Object.assign({}, input, { testCases: extractTestCases(input.testReport) });
    })
    .share();

export {
    configIntervalObservable,
    jobObservable,
    buildObservable,
    upstreamBuildObservable,
    testReportObservable,
    testCasesObservable
}
