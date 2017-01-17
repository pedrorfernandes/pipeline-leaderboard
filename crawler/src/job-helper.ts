import { jenkinsInstance as jenkins } from './jenkins';

function getUpstreamBuild(jobName: string, build: JenkinsBuild, upstreamJobName: string): Promise<JenkinsBuild> {

    const { upstreamProject, upstreamBuild } =
        build.actions
            .filter((action) => action.hasOwnProperty('causes'))
            .map((action) => action['causes'][0])
            .pop();

    // TODO lazy load from DB
    if (!upstreamProject) {
        return jenkins.build.get(jobName, build.number - 1)
            .then((jenkinsBuild) => getUpstreamBuild(jobName, jenkinsBuild, upstreamJobName));
    }

    if (upstreamProject === upstreamJobName) {
        return jenkins.build.get(upstreamProject, upstreamBuild);
    }

    if (upstreamProject !== upstreamJobName) {
        return jenkins.build.get(upstreamProject, upstreamBuild)
            .then((jenkinsBuild) => getUpstreamBuild(upstreamProject, jenkinsBuild, upstreamJobName));
    }
}

export {
    getUpstreamBuild
}