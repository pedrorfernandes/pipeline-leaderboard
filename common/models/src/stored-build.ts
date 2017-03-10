import { dbInstance } from '../../connections/database';
import { stringToHash } from './to-hash';
import { upsertItems } from '../../knex/upsert';
import { StoredJob } from './stored-job';

class StoredBuild {

    static toId(job: JenkinsJob, build: JenkinsBuild) {
        return job ? stringToHash(`${job.name}${build.number}`) : undefined;
    }

    static save(
        job: JenkinsJob,
        build: JenkinsBuild,
        testReport?: JenkinsTestReport,
        upstreamJob?: JenkinsJob,
        upstreamBuild?: JenkinsBuild
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