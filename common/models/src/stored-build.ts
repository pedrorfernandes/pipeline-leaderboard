import { dbInstance } from '../../connections/database';
import { stringToHash } from './to-hash';
import { upsertItems } from '../../knex/upsert';
import { StoredJob } from './stored-job';
import * as Jenkins from 'jenkins';

class StoredBuild {

    static toId(job: Jenkins.Job, build: Jenkins.Build) {
        return job ? stringToHash(`${job.name}${build.number}`) : undefined;
    }

    static save(
        job: Jenkins.Job,
        build: Jenkins.Build,
        testReport?: Jenkins.TestReport,
        upstreamJob?: Jenkins.Job,
        upstreamBuild?: Jenkins.Build
    ) {
        return upsertItems(dbInstance, 'JobBuild', 'buildId', {
            buildId: StoredBuild.toId(job, build),
            jobId: StoredJob.toId(job),
            upstreamBuildId: StoredBuild.toId(upstreamJob, upstreamBuild),
            number: build.number,
            buildJson: JSON.stringify(build),
            testReportJson: testReport
                ? JSON.stringify(testReport)
                : undefined
        });
    }
}

export { StoredBuild };