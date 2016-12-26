import * as Jenkins from 'jenkins';

export function getInstance(host = process.env.JENKINS_HOST,
                            user = process.env.JENKINS_USER,
                            pass = process.env.JENKINS_PASS) {
    const url = `http://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${encodeURIComponent(host)}/`;

    return Jenkins({ baseUrl: url, promisify: true });
}
