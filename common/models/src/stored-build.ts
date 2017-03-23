import { dbInstance } from '../../connections/database';
import { stringToHash } from './to-hash';
import { upsertItems } from '../../knex/upsert';
import { StoredJob } from './stored-job';
import * as Jenkins from 'jenkins';

class StoredBuild {

    buildId: number;
    [key: string]: any;
    number: number;
    actions: any[];
    name: string;

    static toId(job: StoredJob, build: Jenkins.Build) {
        return job ? stringToHash(`${job.name}${build.number}`) : undefined;
    }

    static save(
        storedJob: StoredJob,
        build: Jenkins.Build,
        testReport?: Jenkins.TestReport,
        upstreamJob?: StoredJob,
        upstreamBuild?: StoredBuild
    ): Promise<StoredBuild> {

        const upstreamBuildId = upstreamBuild ? upstreamBuild.buildId : undefined;

        const storedBuild: StoredBuild = Object.assign({}, build, {
            buildId: StoredBuild.toId(storedJob, build),
            upstreamBuildId
        });

        return upsertItems(dbInstance, 'JobBuild', 'buildId', {
            buildId: StoredBuild.toId(storedJob, build),
            jobId: storedJob.jobId,
            upstreamBuildId,
            number: build.number,
            buildJson: JSON.stringify(build),
            testReportJson: testReport ? JSON.stringify(testReport) : undefined
        }).then(() => storedBuild);
    }
}

export { StoredBuild };