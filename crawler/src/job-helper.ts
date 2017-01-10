import { jenkinsInstance as jenkins } from './jenkins';

function getProductBuild (jobName: string, build: JenkinsBuild, productJobName: string): Promise<JenkinsBuild> {

    const { upstreamProject, upstreamBuild } = build.actions
        .filter((action) => action.hasOwnProperty('causes'))
        .map((action) => action['causes'][0])
        .pop();

    // TODO lazy load from DB
    if (!upstreamProject) {
        return jenkins.build.get(jobName, build.number - 1)
            .then((jenkinsBuild) => getProductBuild(jobName, jenkinsBuild, productJobName));
    }

    if (upstreamProject === productJobName) {
        return jenkins.build.get(upstreamProject, upstreamBuild);
    }

    if (upstreamProject !== productJobName) {
        return jenkins.build.get(upstreamProject, upstreamBuild)
            .then((jenkinsBuild) => getProductBuild(upstreamProject, jenkinsBuild, productJobName));
    }

    return Promise.reject('Could not find product build');
}

export {
    getProductBuild
}