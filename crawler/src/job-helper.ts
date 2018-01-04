import { jenkinsInstance as jenkins } from './jenkins';
import * as Jenkins from 'jenkins';

function getUpstreamBuild(jobName: string, build: Jenkins.Build, upstreamJobName: string): Promise<Jenkins.Build> {

    const { upstreamProject, upstreamBuild } =
        build.actions
            .filter((action) => action.hasOwnProperty('causes'))
            .map((action) => action['causes'][0])
            .pop();

    // TODO lazy load from DB
    if (!upstreamProject) {
        return jenkins.build.get(jobName, build.number - 1)
            .then((JenkinsBuild) => getUpstreamBuild(jobName, JenkinsBuild, upstreamJobName));
    }

    if (upstreamProject === upstreamJobName) {
        return jenkins.build.get(upstreamProject, upstreamBuild);
    }

    if (upstreamProject !== upstreamJobName) {
        return jenkins.build.get(upstreamProject, upstreamBuild)
            .then((JenkinsBuild) => getUpstreamBuild(upstreamProject, JenkinsBuild, upstreamJobName));
    }
}

export {
    getUpstreamBuild
}
