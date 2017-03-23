import { StoredJob } from '../../common/models/src/stored-job';
import { StoredBuild } from '../../common/models/src/stored-build';
import { StoredTestCase } from '../../common/models/src/stored-test-case';

import {
    testCasesObservable
} from './jenkins-streams';

const storedJobObservable = testCasesObservable
    .flatMap(
        ({ upstreamJob }) => StoredJob.save(upstreamJob),
        (input, storedUpstreamJob) => Object.assign({}, input, { storedUpstreamJob })
    )
    .flatMap(
        ({ job, storedUpstreamJob }) => StoredJob.save(job, storedUpstreamJob),
        (input, storedJob) => Object.assign({}, input, { storedJob })
    )
    .share();

const storedBuildObservable = storedJobObservable
    .flatMap(
        ({ storedUpstreamJob, upstreamBuild }) => StoredBuild.save(storedUpstreamJob, upstreamBuild),
        (input, storedUpstreamBuild) => Object.assign({}, input, { storedUpstreamBuild })
    )
    .flatMap(
        ({ storedJob, build, testReport, storedUpstreamJob, storedUpstreamBuild }) =>
            StoredBuild.save(storedJob, build, testReport, storedUpstreamJob, storedUpstreamBuild),
        (input, storedBuild) => Object.assign({}, input, { storedBuild })
    )
    .share();

const storedTestCaseObservable = storedBuildObservable
    .flatMap(
        ({ storedJob, storedBuild, testCases }) => StoredTestCase.save(storedJob, storedBuild, testCases),
        (input, storedTestCases) => Object.assign({}, input, { storedTestCases })
    )
    .share();

export {
    storedJobObservable,
    storedBuildObservable,
    storedTestCaseObservable
}