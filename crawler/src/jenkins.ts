import * as Jenkins from 'jenkins';

const config = require('../../config/jenkins.config.json');

function getInstance(host = config.host, user = config.username, pass = config.password) {
    const url = `http://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${encodeURIComponent(host)}/`;

    return Jenkins({ baseUrl: url, promisify: true });
}

const jenkinsInstance = getInstance();

export {
    jenkinsInstance
};
