import * as Rx from '@reactivex/rxjs';
import { jenkinsInstance as jenkins } from './jenkins';
import { StoredJob } from '../../common/models/src/stored-job';

function getJobNames(observer: Rx.Observer<String>) {
    observer.next('EDS-Test-Mock');
}

function getJob(jobName: String) {
    return Rx.Observable.fromPromise(jenkins.job.get(jobName));
}

function getBuilds(job: JenkinsJob) {
    const buildPromises = job.builds.map((build) => jenkins.build.get(job.name, build.number));

    return Rx.Observable.from(buildPromises)
        .flatMap((buildPromise) => Rx.Observable.fromPromise(buildPromise));
}

function getTestReport({job, build}: {job: JenkinsJob, build: JenkinsBuild}) {
    return jenkins.testReport.get(job.name, build.number);
}

function returnJobAndBuild(job: JenkinsJob, build: JenkinsBuild) {
    return { job, build };
}

function returnJobAndBuildAndTestReport(
    { job, build }: { job: JenkinsJob, build: JenkinsBuild},
    testReport: JenkinsTestReport
) {
    return { job, build, testReport };
}

const cronObservable: Rx.Observable<String> = Rx.Observable.create(getJobNames);

const jobObservable = cronObservable.flatMap(getJob);

jobObservable.map((job) => StoredJob.save(job));

const buildObservable = jobObservable.flatMap(getBuilds, returnJobAndBuild);

const testReportObservable = buildObservable.flatMap(getTestReport, returnJobAndBuildAndTestReport);

testReportObservable.subscribe(({job, build, testReport}) => {
    console.log('GOT', job.name, build.number, testReport.totalCount);
});
