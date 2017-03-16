import { dbInstance } from '../../connections/database';
import { stringToHash } from './to-hash';
import { upsertItems } from '../../knex/upsert';
import * as Jenkins from 'jenkins';

class StoredJob {

    static toId(job: Jenkins.Job) {
        return job ? stringToHash(job.name) : undefined;
    }

    static save(job: Jenkins.Job, upstreamJob?: Jenkins.Job) {

        return upsertItems(dbInstance, 'Job', 'jobId', {
            jobId: StoredJob.toId(job),
            upstreamJobId: StoredJob.toId(upstreamJob),
            json: JSON.stringify(job),
            name: job.name
        });
    }
}

export { StoredJob };