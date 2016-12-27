import config from '../../config/jenkins.config.json';
import * as Jenkins from 'jenkins';

export function getInstance(host = config.host,
                            user = config.username,
                            pass = config.password) {
    const url = `http://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${encodeURIComponent(host)}/`;

    return Jenkins({ baseUrl: url, promisify: true });
}
