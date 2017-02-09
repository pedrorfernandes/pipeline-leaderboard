import { dbInstance } from '../../connections/database';
import { stringToHash } from './to-hash';
import { upsertItems } from '../../knex/upsert';

class StoredJob {

    static save = (job: JenkinsJob, upstreamJob?: JenkinsJob) => {
        const jobId = stringToHash(job.name);
        const upstreamJobId = upstreamJob ? stringToHash(upstreamJob.name) : undefined;

        return upsertItems(dbInstance, 'Job', 'jobId', {
            jobId,
            upstreamJobId,
            json: JSON.stringify(job),
            name: job.name
        });
    }
}

export { StoredJob };