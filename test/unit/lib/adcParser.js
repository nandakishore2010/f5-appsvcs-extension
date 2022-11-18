/**
 * Copyright 2022 F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const fs = require('fs');
const sinon = require('sinon');
const nock = require('nock');
const assert = require('assert');
const Ajv = require('ajv');
const As3Parser = require('../../../src/lib/adcParser');

const log = require('../../../src/lib/log');
const Tag = require('../../../src/lib/tag');
const util = require('../../../src/lib/util/util');
const DEVICE_TYPES = require('../../../src/lib/constants').DEVICE_TYPES;
const Context = require('../../../src/lib/context/context');
const Config = require('../../../src/lib/config');

const schemaPath = `${__dirname}/../../../src/schema/latest/adc-schema.json`;
const as3AdcSchema = JSON.parse(fs.readFileSync(schemaPath));

describe('adcParser', function () {
    this.timeout(5000);
    const theParser = new As3Parser(DEVICE_TYPES.BIG_IP, [schemaPath]);
    let logWarningSpy;
    let logErrorSpy;
    let secretTagSpy;
    let context;

    before(() => theParser.loadSchemas([as3AdcSchema]));

    beforeEach(() => {
        context = Context.build();
        context.host.parser = theParser;
        logWarningSpy = sinon.stub(log, 'warning');
        logErrorSpy = sinon.stub(log, 'error');
        sinon.stub(util, 'getNodelist').resolves([]);
        sinon.stub(util, 'getVirtualAddressList').resolves([]);
        sinon.stub(util, 'getAccessProfileList').resolves([]);
        secretTagSpy = sinon.stub(Tag.SecretTag, 'process').resolves();
        sinon.stub(Tag.LongSecretTag, 'process').resolves();
        sinon.stub(Tag.FetchTag, 'process').resolves();
        sinon.stub(Tag.BigComponentTag, 'process').resolves();
        sinon.stub(Config, 'getAllSettings').resolves({ serviceDiscoveryEnabled: true });
    });

    afterEach(() => {
        sinon.restore();
        nock.cleanAll();
    });

    function parseDeclaration(declaration, deviceType, options) {
        const opts = Object.assign({}, options);
        if (!deviceType) {
            deviceType = DEVICE_TYPES.BIG_IP;
        }
        theParser.deviceType = deviceType;
        return theParser.digest(context, declaration, opts);
    }

    function assertInvalid(declaration, errMessage, deviceType) {
        return parseDeclaration(declaration, deviceType)
            .then(
                () => {
                    throw new Error('Declaration was successful');
                },
                (err) => {
                    let errMsg;
                    let errMsgFound;
                    if (err) {
                        errMsg = err.errors ? err.errors[0] : (err.message || err);
                        errMsgFound = errMsg.includes(errMessage);
                    } else {
                        const loggedWarning = logWarningSpy.args
                            .find((call) => call[0].errors && call[0].errors[0].includes(errMessage));
                        errMsgFound = typeof loggedWarning !== 'undefined';
                    }
                    assert.equal(errMsgFound, true, `Expected to find error message: ${errMessage}`);
                    return Promise.resolve(true);
                }
            );
    }

    describe('validation', function () {
        it('should fail on empty JSON', () => assertInvalid(
            {},
            'lacks valid \'id\''
        ));

        it('should fail on bad tenant name', () => assertInvalid(
            {
                id: 'id',
                scratch: 'scratch',
                'f5*com': { class: 'Tenant' }
            },
            '"f5*com" should match pattern'
        ));

        it('should call validatePathLength', () => {
            const spy = sinon.spy(theParser, 'validatePathLength');
            const decl = {
                id: 'testPathLength',
                class: 'ADC',
                schemaVersion: '3.0.0',
                testTenant: {
                    class: 'Tenant',
                    app: {
                        class: 'Application',
                        template: 'http',
                        serviceMain: {
                            class: 'Service_HTTP',
                            virtualAddresses: ['198.200.198.200'],
                            virtualPort: 80
                        }
                    }
                }
            };
            return theParser.digest(context, decl)
                .then(() => {
                    sinon.assert.calledOnce(spy);
                });
        });

        it('.validatePathLength should throw when path > 255 chars', () => {
            const decl = {
                id: 'id',
                ThisIsTheTenantForThePathThatWillDefinitelyExceedTheCharacterLimitWhichIsTwoHundredFiftyFive: {
                    class: 'Tenant',
                    NowTheApplicationWillHelpMakeThePathLongerSoThatItWillExceedTheLimitOfCharacters: {
                        class: 'Application',
                        // eslint-disable-next-line max-len
                        AndFinallyWeArriveToAnItemThatWillAlsoBeInThePathSoWeJustNeedSomeMoreCharactersToFinishGettingThere: {}
                    }
                }
            };
            assert.throws(
                () => theParser.validatePathLength(decl),
                /exceeds the 255 full path character limit/
            );
        });

        it('should redact sensitive aws information', () => {
            const decl = {
                id: 'redactAWS',
                class: 'ADC',
                schemaVersion: '3.0.0',
                tenant: {
                    class: 'Tenant',
                    app: {
                        class: 'Application',
                        webpool: {
                            class: 'Pool',
                            members: [
                                {
                                    servicePort: 80,
                                    addressDiscovery: 'aws',
                                    updateInterval: 1,
                                    tagKey: 'foo',
                                    tagValue: 'bar',
                                    addressRealm: 'private',
                                    region: 'us-west-2-lax-1',
                                    accessKeyId: 'xxxxx',
                                    secretAccessKey: 'xxxxx',
                                    credentialUpdate: false
                                }
                            ]
                        }
                    }
                }
            };
            const options = {
                copySecrets: true,
                baseDeclaration: decl
            };
            return parseDeclaration(decl, null, options)
                .then(() => {
                    assert.deepStrictEqual(decl.tenant.app.webpool.members[0].accessKeyId, '<redacted>');
                });
        });

        it('should redact sensitive azure information', () => {
            const decl = {
                id: 'redactAzure',
                class: 'ADC',
                schemaVersion: '3.0.0',
                tenant: {
                    class: 'Tenant',
                    app: {
                        class: 'Application',
                        webpool: {
                            class: 'Pool',
                            members: [
                                {
                                    servicePort: 80,
                                    addressDiscovery: 'azure',
                                    updateInterval: 1,
                                    tagKey: 'foo',
                                    tagValue: 'bar',
                                    apiAccessKey: 'xxxxx',
                                    resourceGroup: 'xxxxx',
                                    subscriptionId: 'xxxxx',
                                    directoryId: 'xxxxx',
                                    applicationId: 'xxxxx'
                                }
                            ]
                        }
                    }
                }
            };
            const options = {
                copySecrets: true,
                baseDeclaration: decl
            };
            return parseDeclaration(decl, null, options)
                .then(() => {
                    assert.deepStrictEqual(decl.tenant.app.webpool.members[0].resourceGroup, '<redacted>');
                    assert.deepStrictEqual(decl.tenant.app.webpool.members[0].subscriptionId, '<redacted>');
                    assert.deepStrictEqual(decl.tenant.app.webpool.members[0].directoryId, '<redacted>');
                    assert.deepStrictEqual(decl.tenant.app.webpool.members[0].applicationId, '<redacted>');
                });
        });
    });

    describe('platform behavior', function () {
        it('should expand decl when on BIG-IP', () => {
            const origDecl = {
                id: 'testBIGIP',
                class: 'ADC',
                schemaVersion: '3.0.0',
                testTenant: {
                    class: 'Tenant',
                    app: {
                        class: 'Application',
                        template: 'http',
                        serviceMain: {
                            class: 'Service_HTTP',
                            virtualAddresses: ['198.200.198.200'],
                            virtualPort: 80
                        }
                    }
                }
            };
            const decl = Object.assign({}, origDecl);
            return parseDeclaration(decl)
                .then(() => {
                    assert.notDeepStrictEqual(decl, origDecl);
                    assert.strictEqual(decl.id, origDecl.id);
                    // test one of the known defaults
                    assert.strictEqual(decl.testTenant.app.enable, true);
                });
        });

        it('should still validate when on BIG-IQ', () => assertInvalid(
            {
                id: 'id',
                tenant: { class: 'Tenant' }
            },
            'should have required property \'class\'',
            DEVICE_TYPES.BIG_IQ
        ));

        it('should still handle secrets when on BIG-IQ', () => {
            const origDecl = {
                id: 'testBIGIQ-encrypt',
                class: 'ADC',
                schemaVersion: '3.0.0',
                target: { address: '1.1.1.1' },
                testTenant: {
                    class: 'Tenant',
                    app: {
                        class: 'Application',
                        template: 'generic',
                        webcert1: {
                            class: 'Certificate',
                            certificate: '-----BEGIN CERTIFICATE-----theCert-----END CERTIFICATE-----',
                            privateKey: '-----BEGIN RSA PRIVATE KEY-----theKey-----END RSA PRIVATE KEY-----',
                            passphrase: {
                                ciphertext: 'mumblemumble',
                                protected: 'eyJhbGciOiJkaXIiLCJlbmMiOiJub25lIn0'
                            }
                        }
                    }
                }
            };
            const decl = Object.assign({}, origDecl);
            return parseDeclaration(decl, DEVICE_TYPES.BIG_IQ)
                .then(() => {
                    const matchedSecret = secretTagSpy.args
                        .find((call) => call[2].data && call[2].data.ciphertext === 'mumblemumble');
                    assert.notStrictEqual(typeof matchedSecret, undefined);
                });
        });

        it('should NOT expand declaration when on BIG-IQ', () => {
            const origDecl = {
                id: 'testBIGIQ-expand',
                class: 'ADC',
                schemaVersion: '3.0.0',
                target: { address: '1.1.1.1' },
                testTenant: {
                    class: 'Tenant',
                    app: {
                        class: 'Application',
                        template: 'http',
                        serviceMain: {
                            class: 'Service_HTTP',
                            virtualAddresses: ['198.100.198.100']
                        }
                    }
                }
            };
            const decl = Object.assign({}, origDecl);
            return theParser.loadSchemas([as3AdcSchema])
                .then(parseDeclaration(decl, DEVICE_TYPES.BIG_IQ))
                .then(() => {
                    assert.deepStrictEqual(decl, origDecl);
                });
        });

        it('should copy secrets to base declaration if enabled', () => {
            const origDecl = {
                id: 'testBIGIQ-encrypt',
                class: 'ADC',
                schemaVersion: '3.0.0',
                target: { address: '1.1.1.1' },
                testTenant: {
                    class: 'Tenant',
                    app: {
                        class: 'Application',
                        template: 'generic',
                        webcert1: {
                            class: 'Certificate',
                            certificate: '-----BEGIN CERTIFICATE-----theCert-----END CERTIFICATE-----',
                            privateKey: '-----BEGIN RSA PRIVATE KEY-----theKey-----END RSA PRIVATE KEY-----',
                            passphrase: {
                                ciphertext: 'mumblemumble',
                                protected: 'eyJhbGciOiJkaXIiLCJlbmMiOiJub25lIn0'
                            }
                        },
                        monitor1: {
                            class: 'Monitor',
                            monitorType: 'external',
                            script: {
                                url: {
                                    url: 'https://www.example.com',
                                    authentication: {
                                        method: 'bearer-token',
                                        token: 'foo'
                                    }
                                }
                            }
                        }
                    }
                }
            };
            const decl = util.simpleCopy(origDecl);
            const options = {
                copySecrets: true,
                baseDeclaration: origDecl
            };
            const encryptedSecret = {
                ciphertext: 'JE0kZEckTmQwckRjc1R5S3NtN1hQV2xmM3l1dz09',
                protected: 'eyJhbGciOiJkaXIiLCJlbmMiOiJmNXN2In0=',
                miniJWE: true
            };
            const expectDecl = util.simpleCopy(origDecl);
            expectDecl.testTenant.app.webcert1.passphrase = Object.assign({}, encryptedSecret);
            expectDecl.testTenant.app.monitor1.script.url.authentication.token = encryptedSecret.ciphertext;

            Tag.SecretTag.process.restore();
            sinon.stub(Tag.SecretTag, 'process').callsFake((ctrls, dec, sec) => {
                Object.assign(sec[0].data, encryptedSecret);
                return Promise.resolve();
            });

            Tag.LongSecretTag.process.restore();
            sinon.stub(Tag.LongSecretTag, 'process').callsFake((ctrls, dec, sec) => {
                sec[0].parentData[sec[0].parentDataProperty] = encryptedSecret.ciphertext;
                return Promise.resolve([]);
            });

            return parseDeclaration(decl, null, options)
                .then(() => {
                    assert.deepStrictEqual(origDecl, expectDecl);
                })
                .catch((err) => {
                    throw err;
                });
        });
    });

    describe('.loadSchemas', () => {
        let compileSpy;
        let addSchemaSpy;
        let parser;
        beforeEach(() => {
            compileSpy = sinon.stub(Ajv.prototype, 'compile').returns(() => {});
            addSchemaSpy = sinon.stub(Ajv.prototype, 'addSchema').returns();
            sinon.stub(Ajv.prototype, 'addKeyword').returns();
            parser = new As3Parser(DEVICE_TYPES.BIG_IP, [schemaPath]);
        });

        const assertLoadSchema = (schemas, expectedIds) => parser.loadSchemas(schemas)
            .then((ids) => {
                assert.deepStrictEqual(ids, expectedIds);
                expectedIds.forEach((id, idx, array) => {
                    if (idx < array.length - 1) {
                        // AJV calls addSchema once internally, so skip the first call
                        assert.strictEqual(addSchemaSpy.args[idx + 1][0].$id, id);
                    } else {
                        assert.strictEqual(compileSpy.args[0][0].$id, id);
                    }
                });
            });

        const assertLoadSchemaError = (schemas, expectedErrorMsg) => {
            let errorFound = false;
            return parser.loadSchemas(schemas)
                .catch((err) => {
                    errorFound = true;
                    assert.strictEqual(err.message, expectedErrorMsg);
                })
                .then(() => {
                    assert.ok(errorFound, 'should have rejected with error');
                });
        };

        it('should reject if sources is not an array',
            () => assertLoadSchemaError({}, 'loadSchemas argument must be an Array'));

        it('should reject if source is not an object, URL, or filename',
            () => assertLoadSchemaError([null], 'loadSchemas argument must be schema, URL, or filename'));

        it('should reject if schema source is missing an $id property', () => {
            nock('https://localhost:8100')
                .get('/schema.json')
                .reply(200, {});
            const schemas = ['https://localhost:8100/schema.json'];
            const expectedErrorMsg = 'loading schema https://localhost:8100/schema.json failed,'
                + ' error: AS3 schema must contain an $id property';
            return assertLoadSchemaError(schemas, expectedErrorMsg)
                .then(() => {
                    assert.strictEqual(logErrorSpy.args[0][0].message, expectedErrorMsg);
                });
        });

        it('should reject if ajv cannot compile schema', () => {
            Ajv.prototype.compile.restore();
            sinon.stub(Ajv.prototype, 'compile').throws(new Error('test compile error'));
            const schemas = [{ $id: 'foo' }];
            const expectedErrorMsg = 'compiling schema foo failed, error: test compile error';
            return assertLoadSchemaError(schemas, expectedErrorMsg)
                .then(() => {
                    assert.strictEqual(logErrorSpy.args[0][0].message, expectedErrorMsg);
                });
        });

        it('should load default schema if sources is undefined',
            () => assertLoadSchema(undefined, [as3AdcSchema.$id]));

        it('should load default schema if sources is empty array',
            () => assertLoadSchema([], [as3AdcSchema.$id]));

        it('should load multiple schemas', () => {
            nock('https://localhost:8100')
                .get('/schema.json')
                .reply(200, { $id: 'hello_world' });
            const schemas = [{ $id: 'foo' }, { $id: 'bar' }, 'https://localhost:8100/schema.json'];
            return assertLoadSchema(schemas, ['foo', 'bar', 'hello_world']);
        });
    });
});