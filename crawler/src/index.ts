import * as Rx from '@reactivex/rxjs';
import { messageObservable } from './slack-streams';
import {
    storedJobObservable,
    storedBuildObservable,
    storedTestCaseObservable
} from './storage-streams';

storedJobObservable.subscribe(
    ({storedJob}) => console.log(`Job ${storedJob.name} was stored`),
    console.error
);

storedBuildObservable.subscribe(
    ({storedJob, storedBuild}) => console.log(`Build ${storedBuild.number} from ${storedJob.name} was stored`),
    console.error
);

storedTestCaseObservable.subscribe(
    ({storedJob, storedBuild, storedTestCases}) => console.log(
        `${storedTestCases.length} tests cases of build ${storedBuild.number} from ${storedJob.name} were stored`
    ),
    console.error
);

messageObservable.subscribe(
    (message) => console.log(`${message} was posted to slack`),
    console.error
);