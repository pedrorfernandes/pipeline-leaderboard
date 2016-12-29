import * as Jenkins from 'jenkins';

let config = require('../../config/jenkins.config.json');

export function getInstance(host = config.host,
                            user = config.username,
                            pass = config.password) {
    const url = `http://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${encodeURIComponent(host)}/`;

    return Jenkins({ baseUrl: url, promisify: true });
}
