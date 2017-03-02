import { StoredJob } from '../../common/models/src/stored-job';
import { StoredBuild } from '../../common/models/src/stored-build';
import { StoredTestCase } from '../../common/models/src/stored-test-case';

import {
    jobObservable,
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
    .flatMap(function ({ job, upstreamJob, build, testReport }) {
        return StoredTestCase.save(job, upstreamJob, build, testReport);
    })
    .flatMap((testCases) => testCases);

export {
    storedJobObservable,
    storedBuildObservable,
    storedTestCaseObservable
}