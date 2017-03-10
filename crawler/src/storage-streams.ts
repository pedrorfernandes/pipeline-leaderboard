import { StoredJob } from '../../common/models/src/stored-job';
import { StoredBuild } from '../../common/models/src/stored-build';
import { StoredTestCase } from '../../common/models/src/stored-test-case';

import {
    testCasesObservable
} from './jenkins-streams';

function returnInput<I> (input: I) {
    return input;
}

const storedJobObservable = testCasesObservable
    .flatMap(
        ({ upstreamJob }) => StoredJob.save(upstreamJob),
        returnInput
    )
    .flatMap(
        ({ job, upstreamJob }) => StoredJob.save(job, upstreamJob),
        returnInput
    )
    .share();

const storedBuildObservable = storedJobObservable
    .flatMap(
        ({ upstreamJob, upstreamBuild }) => StoredBuild.save(upstreamJob, upstreamBuild),
        returnInput
    )
    .flatMap(
        ({ job, build, testReport, upstreamJob, upstreamBuild }) =>
            StoredBuild.save(job, build, testReport, upstreamJob, upstreamBuild),
        returnInput
    )
    .share();

const storedTestCaseObservable = storedBuildObservable
    .flatMap(
        ({ job, upstreamJob, build, testCases }) =>
            StoredTestCase.save(job, upstreamJob, build, testCases),
        returnInput
    )
    .share();

export {
    storedJobObservable,
    storedBuildObservable,
    storedTestCaseObservable
}