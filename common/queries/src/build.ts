import { dbInstance } from '../../connections/database';
import * as Jenkins from 'jenkins';

function getBuilds(jobName: string, buildNumbers: number[]): Promise<Jenkins.Build[]> {
    return dbInstance('JobBuild')
        .innerJoin('Job', 'JobBuild.jobId', 'Job.jobId')
        .where({ name: jobName })
        .whereIn('number', buildNumbers)
        .then((results) => results.map(({ buildJson }) => buildJson));
}

export {
    getBuilds
}