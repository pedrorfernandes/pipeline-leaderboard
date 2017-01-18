import { dbInstance } from '../../connections/database';
import { stringToHash } from './to-hash';

const jobTable = dbInstance('Job');

class StoredJob {

    static save(job: JenkinsJob, upstreamJob?: JenkinsJob) {
        const jobId = stringToHash(job.name);
        const upstreamJobId = upstreamJob ? stringToHash(upstreamJob.name) : undefined;

        return jobTable.insert({
            jobId,
            upstreamJobId,
            json: JSON.stringify(job),
            name: job.name
        });
    }
}

export { StoredJob };