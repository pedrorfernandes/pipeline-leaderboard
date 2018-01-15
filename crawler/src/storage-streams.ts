import { StoredJob } from '../../common/models/src/stored-job';
import { StoredBuild } from '../../common/models/src/stored-build';
import { StoredTestCase } from '../../common/models/src/stored-test-case';

import {
    testCasesObservable
} from './jenkins-streams';

const storedJobObservable = testCasesObservable
    .flatMap(
        ({ upstreamJob }) => StoredJob.save(upstreamJob),
        (input, storedUpstreamJob) => ({ ...input, storedUpstreamJob })
    )
    .flatMap(
        ({ job, storedUpstreamJob }) => StoredJob.save(job, storedUpstreamJob),
        (input, storedJob) => ({ ...input, storedJob })
    )
    .share();

const storedBuildObservable = storedJobObservable
    .flatMap(
        ({ storedUpstreamJob, upstreamBuild }) => StoredBuild.save(storedUpstreamJob, upstreamBuild),
        (input, storedUpstreamBuild) => ({ ...input, storedUpstreamBuild })
    )
    .flatMap(
        ({ storedJob, build, testReport, storedUpstreamJob, storedUpstreamBuild }) =>
            StoredBuild.save(storedJob, build, testReport, storedUpstreamJob, storedUpstreamBuild),
        (input, storedBuild) => ({ ...input, storedBuild })
    )
    .share();

const storedTestCaseObservable = storedBuildObservable
    .flatMap(
        ({ storedJob, storedBuild, testCases }) => StoredTestCase.save(storedJob, storedBuild, testCases),
        (input, storedTestCases) => ({ ...input, storedTestCases })
    )
    .share();

export {
    storedJobObservable,
    storedBuildObservable,
    storedTestCaseObservable
}