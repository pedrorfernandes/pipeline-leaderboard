import { dbInstance } from '../../connections/database';
import { stringToHash } from './to-hash';
import { upsertItems } from '../../knex/upsert';

class StoredJob {

    static toId(job: JenkinsJob) {
        return job ? stringToHash(job.name) : undefined;
    }

    static save(job: JenkinsJob, upstreamJob?: JenkinsJob) {

        return upsertItems(dbInstance, 'Job', 'jobId', {
            jobId: StoredJob.toId(job),
            upstreamJobId: StoredJob.toId(upstreamJob),
            json: JSON.stringify(job),
            name: job.name
        });
    }
}

export { StoredJob };