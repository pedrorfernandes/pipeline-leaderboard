import * as Rx from '@reactivex/rxjs';
import { jenkinsInstance as jenkins } from './jenkins';
import { StoredJob } from '../../common/models/src/stored-job';
import { getUpstreamBuild } from './job-helper';
import * as lodash from 'lodash';
const config = require('../../config/jenkins.config.json');
const HOUR_IN_MILLISECONDS = 3600000;
const POLLING_INTERVAL = config['polling-interval-hours'] * HOUR_IN_MILLISECONDS;

class JobConfig {
    testJob: string;
    productJob: string;
}

const configIntervalObservable: Rx.Observable<JobConfig> =
    Rx.Observable
        .timer(0, POLLING_INTERVAL)
        .flatMap(() => config.jobs)
        .share();

function logErrorAndContinueWith(defaultValue) {
    return function onError(error) {
        return Rx.Observable
            .of(defaultValue)
            .do(() => console.error(error));
    };
}

const jobObservable = configIntervalObservable
    .flatMap(
        function (jobConfig): Rx.Observable<[JenkinsJob, JenkinsJob]> {
            return Rx.Observable
                .forkJoin([
                    jenkins.job.get(jobConfig.testJob),
                    jenkins.job.get(jobConfig.productJob)
                ])
                .catch(logErrorAndContinueWith([null, null]));
        },
        function returnCombined(jobConfig, [ job, upstreamJob ]) {
            return { job, upstreamJob };
        }
    )
    .filter(({ job, upstreamJob }) => !!job && !!upstreamJob)
    .share();

const buildObservable = jobObservable
  //.filter(isBuildNotInDatabase)
    .flatMap(
        function getBuilds({job}): Rx.Observable<JenkinsBuild> {
            const buildPromises = job.builds.map(
                (build) => jenkins.build.get(job.name, build.number)
            );

            return Rx.Observable
                .from(buildPromises)
                .flatMap((buildPromise) => Rx.Observable.fromPromise(buildPromise))
                .catch(logErrorAndContinueWith(null));
        },
        function returnCombined(input, build) {
            return Object.assign({}, input, { build });
        }
    )
    .filter(({ build }) => !!build)
    .share();

const upstreamBuildObservable = buildObservable
    .flatMap(
        function ({job, upstreamJob, build}): Rx.Observable<JenkinsBuild> {
            return Rx.Observable
                .fromPromise(
                    getUpstreamBuild(job.name, build, upstreamJob.name)
                )
                .catch(logErrorAndContinueWith(null));
        },
        function returnCombined(input, upstreamBuild) {
            return Object.assign({}, input, { upstreamBuild });
        }
    )
    .filter(({ upstreamBuild }) => !!upstreamBuild)
    .share();

const testReportObservable = upstreamBuildObservable
    .flatMap(
        function getTestReport({ job, build }): Rx.Observable<JenkinsTestReport> {
            return Rx.Observable
                .fromPromise(
                    jenkins.testReport.get(job.name, build.number)
                )
                .catch(logErrorAndContinueWith(null));
        },
        function returnCombined(input, testReport) {
            return Object.assign({}, input, { testReport });
        }
    )
    .share();

const extractTestCases = ({ testReport }: { testReport: JenkinsTestReport }) =>
    lodash.flatMap(testReport.childReports, ({ result: { suites } }) =>
        lodash.flatMap(suites, (suite) =>
            lodash.flatMap(suite.cases, (testCase) => ({ testCase, suite }))
        )
    );

const testCasesObservable = testReportObservable
    .map(function addTestCases(input) {
        return Object.assign({}, input, { testCases: extractTestCases(input) });
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
