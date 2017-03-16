import { expect, use } from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import 'sinon-as-promised';
import { load } from 'proxyquire';
import * as Jenkins from 'jenkins';
use(sinonChai);
use(chaiAsPromised);

let jenkins = { build: { get: <sinon.SinonStub>{} } };

const { getUpstreamBuild } = load('../src/job-helper', {
    './jenkins': { jenkinsInstance: jenkins }
});

describe('getUpstreamBuild', function () {

    beforeEach(function () {
        jenkins.build.get = sinon.stub();
        jenkins.build.get.rejects('jenkins.build.get() called with unmocked arguments');
    });

    describe('when the upstream is in the build causes', function () {

        it('should return the build for that job', function () {
            const downstreamBuild = <Jenkins.Build>{
                actions: [{
                    causes: [{
                        upstreamProject: 'upstream', upstreamBuild: 123
                    }]
                }]
            };
            const upstreamBuild = <Jenkins.Build>{ name: 'upstream' };

            jenkins.build.get.withArgs('upstream', 123).resolves(upstreamBuild);

            const result = getUpstreamBuild('downstream', downstreamBuild, 'upstream');

            return expect(result).to.eventually.be.equal(upstreamBuild);
        });
    });

    describe('when the upstream is NOT in the build causes', function () {

        it('should search the build causes until it finds the upstream', function () {
            const downstreamBuilds = [1, 2, 3]
                .map((index) => {
                    return <Jenkins.Build>{
                        actions: [{
                            causes: [{
                                upstreamProject: `upstream ${index}`, upstreamBuild: index
                            }]
                        }]
                    };
                })
                .concat([
                    <Jenkins.Build>{
                        actions: [{
                            causes: [{
                                upstreamProject: 'final upstream', upstreamBuild: 123
                            }]
                        }]
                    }
                ]);
            const upstreamBuild = <Jenkins.Build>{ name: 'upstream' };

            jenkins.build.get.withArgs('upstream 1', 1).resolves(downstreamBuilds[1]);
            jenkins.build.get.withArgs('upstream 2', 2).resolves(downstreamBuilds[2]);
            jenkins.build.get.withArgs('upstream 3', 3).resolves(downstreamBuilds[3]);
            jenkins.build.get.withArgs('final upstream', 123).resolves(upstreamBuild);

            const result = getUpstreamBuild('downstream', downstreamBuilds[0], 'final upstream');

            return expect(result).to.eventually.equal(upstreamBuild);
        });

        describe('and the build causes do not contain upstream data', function () {

            it('should search the previous build number', function () {
                const downstreamBuild = <Jenkins.Build>{
                    number: 30,
                    actions: [{
                        causes: [{
                            shortDescription: 'Started by user RacingMackerel', userName: 'RacingMackerel'
                        }]
                    }]
                };
                const previousDownstreamBuild = <Jenkins.Build>{
                    number: 29,
                    actions: [{
                        causes: [{
                            upstreamProject: 'upstream', upstreamBuild: 123
                        }]
                    }]
                };
                const upstreamBuild = <Jenkins.Build>{ name: 'upstream' };

                jenkins.build.get.withArgs('downstream', 29).resolves(previousDownstreamBuild);
                jenkins.build.get.withArgs('upstream', 123).resolves(upstreamBuild);

                const result = getUpstreamBuild('downstream', downstreamBuild, 'upstream');

                return expect(result).to.eventually.equal(upstreamBuild);
            });

            describe('and the previous build does not exist', function () {

                it('should return an error', function () {
                    const downstreamBuild = <Jenkins.Build>{
                        number: 30,
                        actions: [{
                            causes: [{
                                shortDescription: 'Started by user RacingMackerel', userName: 'RacingMackerel'
                            }]
                        }]
                    };
                    const previousDownstreamBuild = <Jenkins.Build>{
                        number: 29,
                        actions: [{
                            causes: [{
                                shortDescription: 'Started by user RacingMackerel', userName: 'RacingMackerel'
                            }]
                        }]
                    };

                    jenkins.build.get.withArgs('downstream', 29).resolves(previousDownstreamBuild);
                    jenkins.build.get.withArgs('downstream', 28).rejects('Build 28 does not exist');

                    const result = getUpstreamBuild('downstream', downstreamBuild, 'upstream');

                    return expect(result).to.eventually.be.rejectedWith('Build 28 does not exist');
                });
            });
        });
    });
});