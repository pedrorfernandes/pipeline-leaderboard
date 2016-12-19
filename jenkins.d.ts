// https://www.npmjs.org/package/jenkins


interface JenkinsNodeInfo {
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
    temporarilyOffline: boolean
}

interface JenkinsNodeListInfo {
    busyExecutors: number;
    displayName: string;
    totalExecutors: number;
    computer: JenkinsNodeInfo[];
}

interface JenkinsNodeCreateParam {
    nodeDescription: string;
    numExecutors?: number;
    remoteFS: string;
    labelString: string;
    exclusive?: boolean;
    retentionStrategy?: any;
    nodeProperties?: any;
    launcher?: any;
}

interface JenkinsBuild {
    [key: string]: any;
    number: number;
}

interface JenkinsJob {
    [key: string]: any;
    builds: {[key: string]: any, number: number}[];
    name: string;
}

interface JenkinsTestReport {
    totalCount: number
}

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
    module j {
        interface BuildApi {
            get(name, number, opts): Promise<JenkinsBuild>;
            get(name, number): Promise<JenkinsBuild>;
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
            get(name, opts): Promise<JenkinsJob>;
            get(name): Promise<JenkinsJob>;
            list<T>(): Promise<T>;
        }

        interface NodeApi {
            create<T>(name, opts: JenkinsNodeCreateParam): Promise<T>;
            create<T>(name): Promise<T>;
            delete<T>(name): Promise<T>;
            disable<T>(name, message): Promise<T>;
            disable<T>(name): Promise<T>;
            enable<T>(name): Promise<T>;
            exists<T>(name): Promise<T>;
            get<T>(name): Promise<T>;
            list(): Promise<JenkinsNodeListInfo>;
        }

        interface QueueApi {
            get<T>(opts): Promise<T>;
            get<T>(): Promise<T>;
            cancel<T>(number): Promise<T>;
        }

        interface TestReportApi {
            get(name: string, number: number): Promise<JenkinsTestReport>;
        }

        export interface JenkinsApi {
            get<T>(): Promise<T>;
            build: BuildApi;
            job: JobApi;
            node: NodeApi;
            queue: QueueApi;
            testReport: TestReportApi;
        }
    }
    function j(aUrl: string):j.JenkinsApi;
    function j({baseUrl: string, promisify: boolean}):j.JenkinsApi;

    export = j;
}