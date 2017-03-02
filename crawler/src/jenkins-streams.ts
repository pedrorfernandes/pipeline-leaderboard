import * as Rx from '@reactivex/rxjs';
import { jenkinsInstance as jenkins } from './jenkins';
import { StoredJob } from '../../common/models/src/stored-job';
import { getUpstreamBuild } from './job-helper';
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

const jobObservable = configIntervalObservable
    .flatMap(
        function (jobConfig) {
            return Promise.all([
                jenkins.job.get(jobConfig.testJob),
                jenkins.job.get(jobConfig.productJob)
            ]);
        },
        function returnCombined(jobConfig, [job, upstreamJob]) {
            return { job, upstreamJob };
        }
    )
    .share();

const buildObservable = jobObservable
  //.filter(isBuildNotInDatabase)
    .flatMap(
        function getBuilds({job}) {
            const buildPromises = job.builds.map(
                (build) => jenkins.build.get(job.name, build.number)
            );

            return Rx.Observable
                .from(buildPromises)
                .flatMap((buildPromise) => Rx.Observable.fromPromise(buildPromise));
        },
        function returnCombined(result, build) {
            return Object.assign({}, result, { build });
        }
    )
    .share();

const upstreamBuildObservable = buildObservable
    .flatMap(
        function ({job, upstreamJob, build}) {
            return getUpstreamBuild(job.name, build, upstreamJob.name);
        },
        function returnCombined(result, upstreamBuild) {
            return Object.assign({}, result, { upstreamBuild });
        }
    )
    .share();

const testReportObservable = buildObservable
    .flatMap(
        function getTestReport({ job, build }) {
            return jenkins.testReport.get(job.name, build.number);
        },
        function returnCombined(result, testReport) {
            return Object.assign({}, result, { testReport });
        }
    )
    .share();

export {
    configIntervalObservable,
    jobObservable,
    buildObservable,
    upstreamBuildObservable,
    testReportObservable
}
