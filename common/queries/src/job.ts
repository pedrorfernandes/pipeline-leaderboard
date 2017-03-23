import { dbInstance } from '../../connections/database';
import * as Jenkins from 'jenkins';

function getJob(name: string): Promise<Jenkins.Job> {
    return dbInstance('Job')
        .where({ name })
        .then(([{ json }]) => json);
}

export {
    getJob
}