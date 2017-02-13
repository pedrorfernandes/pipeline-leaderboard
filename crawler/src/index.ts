import * as Rx from '@reactivex/rxjs';
import { StoredJob } from '../../common/models/src/stored-job';
import { StoredBuild } from '../../common/models/src/stored-build';
import { StoredTestCase } from '../../common/models/src/stored-test-case';

import {
    jobObservable,
    buildObservable,
    upstreamBuildObservable,
    testReportObservable
} from './jenkins-streams';

const storedJobObservable = jobObservable
    .map(function ({ job, upstreamJob }) {
        return StoredJob.save(upstreamJob)
            .then(() => StoredJob.save(job, upstreamJob));
    });

const storedBuildObservable = testReportObservable
    .map(function ({ job, upstreamJob, build, testReport }) {
        return StoredBuild.save(job, upstreamJob, build, testReport);
    });

const storedTestCaseObservable = testReportObservable
    .map(function ({ job, upstreamJob, build, testReport }) {
        return StoredTestCase.save(job, upstreamJob, build, testReport);
    });

[storedJobObservable, storedBuildObservable, storedTestCaseObservable]
    .map((observable) => observable.subscribe());

testReportObservable.subscribe(
    function ({job, build, upstreamJob, testReport}) {
        console.log('GOT', job.name, build.number, upstreamJob.name, testReport.totalCount);
    },
    function (error) {
        console.log(error);
    }
);
