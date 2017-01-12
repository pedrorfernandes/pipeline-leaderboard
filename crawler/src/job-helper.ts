import { jenkinsInstance as jenkins } from './jenkins';

const isStartedByRemoteHost = (shortDescription) => /Started by remote host.*/.test(shortDescription);

function getUpstreamBuild(jobName: string, build: JenkinsBuild, upstreamJobName: string): Promise<JenkinsBuild> {

    const { upstreamProject, upstreamBuild, shortDescription } =
        build.actions
            .filter((action) => action.hasOwnProperty('causes'))
            .map((action) => action['causes'][0])
            .pop();

    if (isStartedByRemoteHost(shortDescription)) {
        return Promise.reject('The provided build is not caused by the upstream');
    }

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

    return Promise.reject('Could not find product build');
}

export {
    getUpstreamBuild
}