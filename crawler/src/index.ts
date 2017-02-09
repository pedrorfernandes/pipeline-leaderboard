import * as Rx from '@reactivex/rxjs';
import { jenkinsInstance as jenkins } from './jenkins';
import { StoredJob } from '../../common/models/src/stored-job';
import { getUpstreamBuild } from './job-helper';
const config = require('../../config/jenkins.config.json');

class JobConfig {
    testJob: string;
    productJob: string;
}

const cronObservable: Rx.Observable<JobConfig> = Rx.Observable.create(
    function getJobNames(observer: Rx.Observer<JobConfig>) {
        config.jobs.map((jobConfig) => observer.next(jobConfig));
    }
);

const jobObservable = cronObservable.flatMap(
    function (jobConfig) {
        return Rx.Observable.forkJoin(
            jenkins.job.get(jobConfig.testJob),
            jenkins.job.get(jobConfig.productJob)
        );
    },
    function returnCombined(jobConfig, [job, upstreamJob]) {
        return { job, upstreamJob };
    }
);

const buildObservable = jobObservable.flatMap(
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
);

const jobAndUpstream = buildObservable.flatMap(
    function ({job, upstreamJob, build}) {
        return getUpstreamBuild(job.name, build, upstreamJob.name);
    },
    function returnCombined(result, upstreamBuild) {
        return Object.assign({}, result, { upstreamBuild });
    }
);

const testReportObservable = jobAndUpstream.flatMap(
    function getTestReport({ job, build }) {
        return jenkins.testReport.get(job.name, build.number);
    },
    function returnCombined(result, testReport) {
        return Object.assign({}, result, { testReport });
    }
);

testReportObservable.subscribe(({job, build, testReport}) => {
    console.log('GOT', job.name, build.number, testReport.totalCount);
});
