import { dbInstance } from '../../connections/database';
import { stringToHash } from './to-hash';
import { upsertItems } from '../../knex/upsert';
import * as Jenkins from 'jenkins';

class StoredJob {

    jobId: number;
    upstreamJobId: number;
    builds: { [key: string]: any, number: number }[];
    name: string;
    [key: string]: any;

    static toId(job: Jenkins.Job) {
        return job ? stringToHash(job.name) : undefined;
    }

    static save(job: Jenkins.Job, upstreamJob?: StoredJob): Promise<StoredJob> {

        const upstreamJobId = upstreamJob ? upstreamJob.jobId : undefined;

        const storedJob: StoredJob = Object.assign({}, job, {
            jobId: StoredJob.toId(job),
            upstreamJobId
        });

        return upsertItems(dbInstance, 'Job', 'jobId', {
            jobId: StoredJob.toId(job),
            upstreamJobId,
            json: JSON.stringify(job),
            name: job.name
        }).then(() => storedJob);
    }
}

export { StoredJob };