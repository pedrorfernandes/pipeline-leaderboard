// https://www.npmjs.org/package/jenkins
/*
 {
 name: name,
 nodeDescription: opts.nodeDescription,
 numExecutors: opts.hasOwnProperty('numExecutors') ? opts.numExecutors : 2,
 remoteFS: opts.remoteFS || '/var/lib/jenkins',
 labelString: opts.labelString,
 mode: opts.exclusive ? 'EXCLUSIVE' : 'NORMAL',
 type: o.qs.type,
 retentionStrategy: opts.retentionStrategy || {'stapler-class': 'hudson.slaves.RetentionStrategy$Always'},
 nodeProperties: opts.nodeProperties || {'stapler-class-bag': 'true'},
 launcher: opts.launcher || {'stapler-class': 'hudson.slaves.JNLPLauncher'},
 }
 */


declare module "jenkins" {
    module Jenkins {
        interface BuildApi {
            get(name, number, opts): Promise<Build>;
            get(name, number): Promise<Build>;
            stop<T>(name, number): Promise<T>;
        }

        interface JobApi {
            build<T>(name, opts): Promise<T>;
            build<T>(name): Promise<T>;
            config<T>(name): Promise<T>;
            config<T>(name, xml): Promise<T>;
            copy<T>(srcName, dstName): Promise<T>;
            create<T>(name, xml): Promise<T>;
            delete<T>(name): Promise<T>;
            disable<T>(name): Promise<T>;
            enable<T>(name): Promise<T>;
            exists<T>(name): Promise<T>;
            get(name, opts): Promise<Job>;
            get(name): Promise<Job>;
            list<T>(): Promise<T>;
        }

        interface NodeApi {
            create<T>(name, opts: NodeCreateParam): Promise<T>;
            create<T>(name): Promise<T>;
            delete<T>(name): Promise<T>;
            disable<T>(name, message): Promise<T>;
            disable<T>(name): Promise<T>;
            enable<T>(name): Promise<T>;
            exists<T>(name): Promise<T>;
            get<T>(name): Promise<T>;
            list(): Promise<NodeListInfo>;
        }

        interface QueueApi {
            get<T>(opts): Promise<T>;
            get<T>(): Promise<T>;
            cancel<T>(number): Promise<T>;
        }

        interface TestReportApi {
            get(name: string, number: number): Promise<TestReport>;
        }

        export interface JenkinsApi {
            get<T>(): Promise<T>;
            build: BuildApi;
            job: JobApi;
            node: NodeApi;
            queue: QueueApi;
            testReport: TestReportApi;
        }

        export class NodeInfo {
            actions: any[];
            displayName: string;
            executors: any[];
            icon: string;
            idle: boolean;
            jnlpAgent: boolean;
            launchSupported: boolean;
            loadStatistics: any;
            manualLaunchAllowed: boolean;
            monitorData: any[];
            numExecutors: number;
            offline: boolean;
            offlineCause: any;
            offlineCauseReason: string;
            oneOffExecutors: any[];
            temporarilyOffline: boolean;
        }

        export class NodeListInfo {
            busyExecutors: number;
            displayName: string;
            totalExecutors: number;
            computer: NodeInfo[];
        }

        export class NodeCreateParam {
            nodeDescription: string;
            numExecutors?: number;
            remoteFS: string;
            labelString: string;
            exclusive?: boolean;
            retentionStrategy?: any;
            nodeProperties?: any;
            launcher?: any;
        }

        export class Build {
            [key: string]: any;
            number: number;
            actions: any[];
            name: string;
        }

        export class Job {
            [key: string]: any;
            builds: { [key: string]: any, number: number }[];
            name: string;
        }

        export class TestReport {
            duration?: number;
            empty?: boolean;
            failCount: number;
            skipCount: number;
            totalCount: number;
            urlName: string;
            suites?: [TestSuite];
            childReports: [{
                child: { number: number, url: string };
                result: TestReport
            }];
        }

        export class TestSuite {
            cases: [TestCase];
            duration: number;
            id: string;
            name: string;
            timestamp: string;
        }

        export class TestCase {
            age: number;
            className: string;
            duration: number;
            failedSince: number;
            name: string;
            skipped: boolean;
            status: string;
        }
    }
    function Jenkins(aUrl: string): Jenkins.JenkinsApi;
    function Jenkins({ baseUrl: string, promisify: boolean }): Jenkins.JenkinsApi;

    export = Jenkins;
}