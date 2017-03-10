import * as Rx from '@reactivex/rxjs';
import {
    storedJobObservable,
    storedBuildObservable,
    storedTestCaseObservable
} from './storage-streams';

// import { testReportObservable } from './jenkins-streams';

// import { messageObservable } from './slack-streams';

[
    storedJobObservable,
    storedBuildObservable,
    storedTestCaseObservable,
    // messageObservable
].map((observable) => observable.subscribe(
    function ({job, build, upstreamJob, testReport}) {
        console.log('GOT', job.name, build.number, upstreamJob.name, testReport.totalCount);
    },
    function (error) {
        console.log(error);
    }
));
