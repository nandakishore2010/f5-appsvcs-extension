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

const assert = require('assert');
const certUtil = require('../../../../src/lib/util/certUtil');

describe('certUtil', () => {
    describe('.validateCertificates', () => {
        const decl = {
            class: 'ADC',
            schemaVersion: '3.0.0',
            id: 'anId',
            TEST_Certificate: {
                class: 'Tenant',
                Application: {
                    class: 'Application',
                    template: 'generic',
                    testItem: {
                        class: 'Certificate',
                        certificate: '-----BEGIN CERTIFICATE-----\nMIIDUjCCAjqgAwIBAgIED1fylDANBgkqhkiG9w0BAQsFADBrMQswCQYDVQQGEwJV\nUzELMAkGA1UECBMCV0ExEDAOBgNVBAcTB1NlYXR0bGUxDTALBgNVBAoTBFRlc3Qx\nHDAaBgNVBAsTE1Byb2R1Y3QgRGV2ZWxvcG1lbnQxEDAOBgNVBAMUB215X3NzbDIw\nHhcNMTgwMjI3MTgwNjEyWhcNMjgwMjI1MTgwNjEyWjBrMQswCQYDVQQGEwJVUzEL\nMAkGA1UECBMCV0ExEDAOBgNVBAcTB1NlYXR0bGUxDTALBgNVBAoTBFRlc3QxHDAa\nBgNVBAsTE1Byb2R1Y3QgRGV2ZWxvcG1lbnQxEDAOBgNVBAMUB215X3NzbDIwggEi\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDJlyIudQpecT+2tfNglb8bhQbX\ne+d5S0UvAGYNGMDXTb8X3/Y/pyo5A7K+Kc5tZ6ZFW7Tjm3Su9dNxA8teh6iDIW20\nQuj7dL2Oh3YbJuEk/aLHLy1VMgoLLm7AW0Shx8wnZ8WVX0G3vD11ZfHtOyGavvyg\nKyaA/Fo7XSWOf/nlkwVtIFAdwDxqZn+dStOslFnbyzKTupp3Ep6lWMH4U8mTIq9q\n7wlNw1CFQR86IkIRfex58SlOph58L0STPzTN4lPEC7VPMhi1/DH/nese5bbZz6VE\nDaS4n07Tmq6EVqBQxB/zEerLagVahzPBvtYsBw+qkiZWUA18XTaGB8/D0dx/AgMB\nAAEwDQYJKoZIhvcNAQELBQADggEBAAzZ/sDmcWEPcbjGhjB+PxQ82OeuAcVF3SJz\nNldCeag2Ohj1mld+AFCQW32qiKjgMmTHNwlS1biNJ0CzqkPSwJ57kuHyrpXd9iFm\n5uW1metsSSOQ8r+kOUlBMmvqcUb2VgzlpLclATMU0Pq76+bx0THi/v8Q57LjqcOJ\nhtLvvLggyKpyGxhFT/3QY/vGvFm231wJk3vziP//JGA5tapeRZ5iTwfIzeoN/Nmi\nNLWKjyYmNLu00TRxNki2D+z4XVl+hhJ4EcDPfRRwXgLv6uEmOpeRAeN2y5OtLrVJ\nxzFHVXv2f7iUOTQq/tCxmftQGc0KTFpL5GCM6tNI+Otci31xZBM=\n-----END CERTIFICATE-----',
                        privateKey: '-----BEGIN RSA PRIVATE KEY-----\nProc-Type: 4,ENCRYPTED\nDEK-Info: AES-256-CBC,BC7025CBA1D3347A8BD2BCF84BE65C82\n\nEcDfqRFgYjE9z51ZLf2C3FiLweX/8Bcw//avQcv4LV+gTpenyWCc1Vc8B7qtYghO\nfcLBfIjqpR6xzBLJEabAnEN1vhQ7G+12d8dxJ0IYktOsN9KyVNY6XaE39XWzOIy/\nRJ5FfQtSIatYJ4w7gXY/m2CAdth7ZoUCeaxa0YDRtv/ogd++rXbb1TwkR8JyA1ZF\n8vOPQSoM7arzHMkZTYMF3dM1PsVCAB/z8O3US0ltjwQhK9hpIu/k0Vg9urqw2rG9\nu8fEboUFfQ2UCpjDdA+oR2bBr0ZzzIM15Cqb5vd8LI8bB9mOPBYNoSC01HhDKXpT\n4edzPeYT5PD7vALr2xJxFy4W18cfKKmlY/SOpZTlgGyrdXGK+24QAnRZXyOTftqd\n6+7j0X6mokEgiesDeQF9LZROFI49ZlvoK4bZ+JqrvX2kqgaxEogHS0Txt/ZM7eJF\nz1OZPlVrdPhv5b2rVeKwNkZZ4nyYC2vRfZf5aSAA1TUXNKW1pUSNDNU04D7Priz2\n0OwjWXkVbDEMRQZ/Yy/KRleaBiYv1kuBrK776h/DFjOXw+4Qj6IBeq79LNO/7uFg\nJLUBgtJExQ3NQCB+po+SyuWIkojGh30jmlQ8dmGyoEZ9muWJg/E5mTuRPb/Zvx0Y\nkHl8MvMq+7yOTf0Z1PH30ml7o9EiNniAN87ZHiU2KjrQ10eXAVJCVmQIzUh/1/DI\n4ILnxuUtOEDhi/2aec+CJJtY0Pq4+XzHcYMte6rlKnRBiCdQ0yY87vm60BLtYTI1\n9QRf0WfJeujPMO1gq5sJbxMmwLQXgzy0tv9M5wNqkCcPGofr3zE7C1c/TjjqyDCR\nTnf3KndGrcOiMo+Ney4eC3nxoof2anjhaaE5Xbz0tivDbxQ/tVj/fu9+uogavFHL\nj3T3LOUNkjokenbA6FiPnJdhLogMBBA727pBeZ8kmCQRGDvTFvcCRwjdlt+fhVgI\n+lnrWDejbrsRYDS6jQs4ow4KQ7RnP4Cj2a+waaXh9zVHU231rasUkMKgMA/ND6ME\nb6BZzii89lG8Yl0XURWeq/2jnpASX39VwXVKlDxuOpv2CN8TKgRGGlkBy3FgVccz\nWGlqKBjHDjUAyLUoQq/cwktfgGPMD6BFlx6/5O9QMM4FXHeyl97+5pe7X5cjW/Nh\nCacfDn9iA09uijOfUoGZYknVA55I+PwUJsvH1Con6UC2FMmlDhJ3D0vWIphtERQV\nDu1SLwsgTGjb+EbbzrfuQEYntkonCyInH+BSE+H86oALy6gtxgmpFvv9nY+Zyqha\nl+b6yPZJ0RqoydhUUS5Nze+wckGUspkaaUfz19NLBax4wfl1y6ETaKQpmENBnfqJ\n2B9DA4omaECONsE1gkPkULi1fivq8TTEoFGTbHVURLzqvtf6kFlYwmbGwJh4NR50\nuv5APydh4ax2oyqqnXqbp3JolUT4/h7AyhvLm+H3Lqf4thm6HmWZPpaufCrKXw6y\nUO9Q92aa/FkSaSwhTtseFdh2pUjOdEIZuyLtxNJcmHbj/meK03sa1mjGgKAI5Wp3\nP72lhPQM07Ytk6nt2Fod3rZBCxPueB8ilo7whrM0Wdy7B3I7qqBLpqHeP4vGItYR\n-----END RSA PRIVATE KEY-----',
                        passPhrase: {
                            cipherText: 'ZjVmNQ==',
                            protected: 'eyJhbGciOiJkaXIiLCJlbmMiOiJub25lIn0'
                        },
                        chainCA: '-----BEGIN CERTIFICATE-----\nMIIDoDCCAoigAwIBAgIED1feTjANBgkqhkiG9w0BAQsFADCBkTELMAkGA1UEBhMC\nVVMxCzAJBgNVBAgTAldBMRAwDgYDVQQHEwdTZWF0dGxlMQ0wCwYDVQQKEwRUZXN0\nMRwwGgYDVQQLExNQcm9kdWN0IERldmVsb3BtZW50MQ8wDQYDVQQDFAZteV9zc2wx\nJTAjBgkqhkiG9w0BCQEWFnNvbWVib2R5QHNvbWV3aGVyZS5jb20wHhcNMTgwMjI3\nMTYzOTQyWhcNMjgwMjI1MTYzOTQyWjCBkTELMAkGA1UEBhMCVVMxCzAJBgNVBAgT\nAldBMRAwDgYDVQQHEwdTZWF0dGxlMQ0wCwYDVQQKEwRUZXN0MRwwGgYDVQQLExNQ\ncm9kdWN0IERldmVsb3BtZW50MQ8wDQYDVQQDFAZteV9zc2wxJTAjBgkqhkiG9w0B\nCQEWFnNvbWVib2R5QHNvbWV3aGVyZS5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IB\nDwAwggEKAoIBAQC0O9Qg8avVtfTpzEwjjM0e+kwFzjFdMmqMVBs6XIo37FsDjbll\nI+7VznRNJPVfRZbnTmyhtHmkpDG/ojLVg7oPWZOY9Zrn7pO96wQxBGkj3E+/3B+T\nBethgXFSLA4sbAhF3Hn+lXP+QuA4KgtcGHDq1EctwZa0/BS8eQFIiWc5c2PAai9Y\nI/nVbu4EkAhhbgTAMzgUnLeRXfyaqmsHVZOXem1ErQVC7M4qwKw2osYlM7qqCgOj\nK1hLwkd3MOIVcgAcUYEYe78dVFhOKglVATVgZhvAVqyTau7eG1sdSLY5aOgHR+Ck\nHWAacIFKKwCZZr6AGFLqxO7tCyzEimmRCBrrAgMBAAEwDQYJKoZIhvcNAQELBQAD\nggEBAHxDtjfTcwqGFuHy7wVsVTg1Mzwvzf0/MG1dstfr9q3onFMpcuZQ2DXWC0rm\ngT3KHaptM+V3iiq5mMv2pPuK4EacDPQdhWBjw5hsVaRu3V7pAo4LHC4UJ3xufXYz\nLVr8wRVMvTMOCNTR0RQ/k1XvIKG1g1H20P/8ZSPYnu05cfvKbPxf9MD5bNCTTuvV\nhAWA8hrDQ+qlAdYx2Tgv59VVkNEWTRto8TU6orREC5F+OUIq3zQcBYjRzfgi9eH6\n8yLnVUlQQX3j6Y2b+ByxBNyo5JanEFLF2s2ioGKK8u3OilPGxDQCtrcc+TJAX9pN\ndaX/vNi6ZxxPwBQx9HctryxB3cc=\n-----END CERTIFICATE-----',
                        staplerOCSP: {
                            bigip: '/Common/theOCSP'
                        }
                    }
                }
            }
        };

        it('should return errors', () => {
            const expected = [
                {
                    dataPath: 'testItem',
                    message: 'staplerOCSP or issuerCertificate cannot be used with a self-signed certificate'
                }
            ];
            const result = certUtil.validateCertificates(decl, []);
            assert.deepStrictEqual(result, expected);
        });

        it('should return empty array', () => {
            delete decl.TEST_Certificate.Application.testItem.staplerOCSP;
            const expected = [];
            const result = certUtil.validateCertificates(decl, []);
            assert.deepStrictEqual(result, expected);
        });
    });

    describe('.checkIfSelfSigned', () => {
        it('should return true', () => {
            const certificate = '-----BEGIN CERTIFICATE-----\nMIIDUjCCAjqgAwIBAgIED1fylDANBgkqhkiG9w0BAQsFADBrMQswCQYDVQQGEwJV\nUzELMAkGA1UECBMCV0ExEDAOBgNVBAcTB1NlYXR0bGUxDTALBgNVBAoTBFRlc3Qx\nHDAaBgNVBAsTE1Byb2R1Y3QgRGV2ZWxvcG1lbnQxEDAOBgNVBAMUB215X3NzbDIw\nHhcNMTgwMjI3MTgwNjEyWhcNMjgwMjI1MTgwNjEyWjBrMQswCQYDVQQGEwJVUzEL\nMAkGA1UECBMCV0ExEDAOBgNVBAcTB1NlYXR0bGUxDTALBgNVBAoTBFRlc3QxHDAa\nBgNVBAsTE1Byb2R1Y3QgRGV2ZWxvcG1lbnQxEDAOBgNVBAMUB215X3NzbDIwggEi\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDJlyIudQpecT+2tfNglb8bhQbX\ne+d5S0UvAGYNGMDXTb8X3/Y/pyo5A7K+Kc5tZ6ZFW7Tjm3Su9dNxA8teh6iDIW20\nQuj7dL2Oh3YbJuEk/aLHLy1VMgoLLm7AW0Shx8wnZ8WVX0G3vD11ZfHtOyGavvyg\nKyaA/Fo7XSWOf/nlkwVtIFAdwDxqZn+dStOslFnbyzKTupp3Ep6lWMH4U8mTIq9q\n7wlNw1CFQR86IkIRfex58SlOph58L0STPzTN4lPEC7VPMhi1/DH/nese5bbZz6VE\nDaS4n07Tmq6EVqBQxB/zEerLagVahzPBvtYsBw+qkiZWUA18XTaGB8/D0dx/AgMB\nAAEwDQYJKoZIhvcNAQELBQADggEBAAzZ/sDmcWEPcbjGhjB+PxQ82OeuAcVF3SJz\nNldCeag2Ohj1mld+AFCQW32qiKjgMmTHNwlS1biNJ0CzqkPSwJ57kuHyrpXd9iFm\n5uW1metsSSOQ8r+kOUlBMmvqcUb2VgzlpLclATMU0Pq76+bx0THi/v8Q57LjqcOJ\nhtLvvLggyKpyGxhFT/3QY/vGvFm231wJk3vziP//JGA5tapeRZ5iTwfIzeoN/Nmi\nNLWKjyYmNLu00TRxNki2D+z4XVl+hhJ4EcDPfRRwXgLv6uEmOpeRAeN2y5OtLrVJ\nxzFHVXv2f7iUOTQq/tCxmftQGc0KTFpL5GCM6tNI+Otci31xZBM=\n-----END CERTIFICATE-----';
            const result = certUtil.checkIfSelfSigned(certificate);
            assert.deepStrictEqual(result, true);
        });

        it('should return false', () => {
            const certificate = '-----BEGIN CERTIFICATE-----\nMIIFLTCCBBWgAwIBAgIMYaHn0gAAAABR02amMA0GCSqGSIb3DQEBCwUAMIG+MQswCQYDVQQGEwJVUzEWMBQGA1UEChMNRW50cnVzdCwgSW5jLjEoMCYGA1UECxMfU2VlIHd3dy5lbnRydXN0Lm5ldC9sZWdhbC10ZXJtczE5MDcGA1UECxMwKGMpIDIwMDkgRW50cnVzdCwgSW5jLiAtIGZvciBhdXRob3JpemVkIHVzZSBvbmx5MTIwMAYDVQQDEylFbnRydXN0IFJvb3QgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgLSBHMjAeFw0xNDEyMTUxNTI1MDNaFw0zMDEwMTUxNTU1MDNaMIG6MQswCQYDVQQGEwJVUzEWMBQGA1UEChMNRW50cnVzdCwgSW5jLjEoMCYGA1UECxMfU2VlIHd3dy5lbnRydXN0Lm5ldC9sZWdhbC10ZXJtczE5MDcGA1UECxMwKGMpIDIwMTQgRW50cnVzdCwgSW5jLiAtIGZvciBhdXRob3JpemVkIHVzZSBvbmx5MS4wLAYDVQQDEyVFbnRydXN0IENlcnRpZmljYXRpb24gQXV0aG9yaXR5IC0gTDFNMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0IHBOSPCsdHs91fdVSQ2kSAiSPf8ylIKsKs/M7WwhAf23056sPuYIj0BrFb7cW2y7rmgD1J3q5iTvjOK64dex6qwymmPQwhqPyK/MzlG1ZTy4kwFItlngJHxBEoOm3yiydJs/TwJhL39axSagR3nioPvYRZ1R5gTOw2QFpi/iuInMlOZmcP7lhw192LtjL1JcdJDQ6Gh4yEqI3CodT2ybEYGYW8YZ+QpfrI8wcVfCR5uRE7sIZlYFUj0VUgqtzS0BeN8SYwAWN46lsw53GEzVc4qLj/RmWLoquY0djGqr3kplnjLgRSvadr7BLlZg0SqCU+01CwBnZuUMWstoc/B5QIDAQABo4IBKzCCAScwDgYDVR0PAQH/BAQDAgEGMB0GA1UdJQQWMBQGCCsGAQUFBwMCBggrBgEFBQcDATASBgNVHRMBAf8ECDAGAQH/AgEAMDMGCCsGAQUFBwEBBCcwJTAjBggrBgEFBQcwAYYXaHR0cDovL29jc3AuZW50cnVzdC5uZXQwMAYDVR0fBCkwJzAloCOgIYYfaHR0cDovL2NybC5lbnRydXN0Lm5ldC9nMmNhLmNybDA7BgNVHSAENDAyMDAGBFUdIAAwKDAmBggrBgEFBQcCARYaaHR0cDovL3d3dy5lbnRydXN0Lm5ldC9ycGEwHQYDVR0OBBYEFMP30LUqMK2vDZEhcDlU3byJcMc6MB8GA1UdIwQYMBaAFGpyJnrQHu995ztpUdRsjZ+QEmarMA0GCSqGSIb3DQEBCwUAA4IBAQC0h8eEIhopwKR47PVPG7SEl2937tTPWa+oQ5YvHVjepvMVWy7ZQ5xMQrkXFxGttLFBx2YMIoYFp7Qi+8VoaIqIMthx1hGOjlJ+Qgld2dnADizvRGsf2yS89byxqsGK5Wbb0CTz34mmi/5e0FC6m3UAyQhKS3Q/WFOv9rihbISYJnz8/DVRZZgeO2x28JkPxLkJ1YXYJKd/KsLak0tkuHB8VCnTglTVz6WUwzOeTTRn4Dh2ZgCN0C/GqwmqcvrOLzWJ/MDtBgO334wlV/H77yiI2YIowAQPlIFpI+CRKMVe1QzX1CA778n4wI+nQc1XRG5sZ2L+hN/nYNjvv9QiHg3n\n-----END CERTIFICATE-----';
            const result = certUtil.checkIfSelfSigned(certificate);
            assert.deepStrictEqual(result, false);
        });
    });

    describe('.parsePkcs12', () => {
        it('should parse pkcs12 with empty passphrase', () => {
            const certificate = 'MIIEdAIBAzCCBDoGCSqGSIb3DQEHAaCCBCsEggQnMIIEIzCCBB8GCSqGSIb3DQEHBqCCBBAwggQMAgEAMIIEBQYJKoZIhvcNAQcBMBwGCiqGSIb3DQEMAQYwDgQIMFpvfHSvJ6sCAggAgIID2PQxcEhhEPgU+sTVw9UncA+U0QYK2/JWQAzfxfD30uR9hXMdFnCF8wJcuUL+4jR+xnrJ9i+F5mISD8zLPipCLs3JuBDGQ8CibTMjcbm54eEzcX6knoQ8r6WZh8tXL+Dniwsnl7FrTwE6br+V/1LQvc03NepYA+xDPgHCOj1qfIcqMyylsf7ZyqYp76nmlv2tkcQrM/f+hcA9UtDuseeRae4ugx5IKkrcIAVYPMfCwRSPkGFWJJofHZaCzeCT4Nq5+ocljogAlqtWSH9nIGEsYxDCrhj3qgZNAPODa1vfnMna3/1md4oRuqI5qe7UQF6e/eltAunZDUtT1vTW+O3vyt3Bqfl18moXocUOuVVi7CNejcA0+IhqryrkI3w4aIXxWVmZ4tl/El/OSjXCRMs+tnTwRZjiCd1dPnKJHjesygupnS4rHus31dQKMmxjyKVrhsl3N+oopbGVWAlaR7p/0DyTdUywBrExyi/c7QvVN/0D08F1TRed4ys3/AVl43dvM9IFGm+ZwsvYyBhRmYn/oL5Dr5u5/jHFhPrWTR35sE5uvcYsJR96hmMqxN57K95MggRcthsrdIvDN+86pqifZoVPTmezFgRuO7NfzhCj/uOd1l61dOKbFNT5DuE5DoyJ8IaVnTJvZ4CAq3O2Ix62LVw0t/lM7AXhkak52LsyJ8VGcaK8R9PhM/X0CYGoRgWyPzJ3GGNX6s9Pw6rV6k5gtYkUagElrsJbcmfabEMZAGwIsVmOpaxdpyuaoo2TR+tz/E1FasC9K3aJ0cEwt6Cm9/tW4qEsb65TBm7C2kXNglUHEmrxndVfMVzKG2dkxUhvJdqw3BxcPukjzk4lpBv2YrTeJs4+y+aRn7F7GUrR4r9Z903ZTbu2DiOEbFEERPq/08zO7zl9pD76KyJfrWWlNW+urwPqEz8i6eDj+/zBlCd6JfXxVgXy8ctHwqKChBNDyimVBvXDD6zIySnazdYVcYycfnSbNo4p2VWztF4C6CvqqOtN39I11LZZ1okZsxpacQEU3nhaRXHw+bMrHfRZNlt5RmCIYnNuB6qTBjL9yaaq/9BNzW2dQnRP2OkeIbfVJN3N00Sey0sbsXUlajEMJW7Efsz6iHtOXZkeTdu8ME7eGBsaRNAX5tcDqMJjnxhGsZSmxLNHW+5OnmNB54sdEMhyM/wYEbxGh6qQEPtbdBhSZIuXiSkfmtI64IdKhBYpLl2rUxDB+nLZisRgea3xCBDxHVd7c0e9u67lT3GetAmFX2GOTA5+a8k3zXnj6te+gN+9ZJhVCOasifNzKpk7WLwZXAgnFWtuXjAxMCEwCQYFKw4DAhoFAAQUL+jxIL4tVgP9Hb2ux92Idbur6QEECEfy4yQcB7vhAgIIAA==';

            const expected = {
                certificates: ['-----BEGIN CERTIFICATE-----\nMIIDoDCCAoigAwIBAgIED1feTjANBgkqhkiG9w0BAQsFADCBkTELMAkGA1UEBhMC\nVVMxCzAJBgNVBAgTAldBMRAwDgYDVQQHEwdTZWF0dGxlMQ0wCwYDVQQKEwRUZXN0\nMRwwGgYDVQQLExNQcm9kdWN0IERldmVsb3BtZW50MQ8wDQYDVQQDFAZteV9zc2wx\nJTAjBgkqhkiG9w0BCQEWFnNvbWVib2R5QHNvbWV3aGVyZS5jb20wHhcNMTgwMjI3\nMTYzOTQyWhcNMjgwMjI1MTYzOTQyWjCBkTELMAkGA1UEBhMCVVMxCzAJBgNVBAgT\nAldBMRAwDgYDVQQHEwdTZWF0dGxlMQ0wCwYDVQQKEwRUZXN0MRwwGgYDVQQLExNQ\ncm9kdWN0IERldmVsb3BtZW50MQ8wDQYDVQQDFAZteV9zc2wxJTAjBgkqhkiG9w0B\nCQEWFnNvbWVib2R5QHNvbWV3aGVyZS5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IB\nDwAwggEKAoIBAQC0O9Qg8avVtfTpzEwjjM0e+kwFzjFdMmqMVBs6XIo37FsDjbll\nI+7VznRNJPVfRZbnTmyhtHmkpDG/ojLVg7oPWZOY9Zrn7pO96wQxBGkj3E+/3B+T\nBethgXFSLA4sbAhF3Hn+lXP+QuA4KgtcGHDq1EctwZa0/BS8eQFIiWc5c2PAai9Y\nI/nVbu4EkAhhbgTAMzgUnLeRXfyaqmsHVZOXem1ErQVC7M4qwKw2osYlM7qqCgOj\nK1hLwkd3MOIVcgAcUYEYe78dVFhOKglVATVgZhvAVqyTau7eG1sdSLY5aOgHR+Ck\nHWAacIFKKwCZZr6AGFLqxO7tCyzEimmRCBrrAgMBAAEwDQYJKoZIhvcNAQELBQAD\nggEBAHxDtjfTcwqGFuHy7wVsVTg1Mzwvzf0/MG1dstfr9q3onFMpcuZQ2DXWC0rm\ngT3KHaptM+V3iiq5mMv2pPuK4EacDPQdhWBjw5hsVaRu3V7pAo4LHC4UJ3xufXYz\nLVr8wRVMvTMOCNTR0RQ/k1XvIKG1g1H20P/8ZSPYnu05cfvKbPxf9MD5bNCTTuvV\nhAWA8hrDQ+qlAdYx2Tgv59VVkNEWTRto8TU6orREC5F+OUIq3zQcBYjRzfgi9eH6\n8yLnVUlQQX3j6Y2b+ByxBNyo5JanEFLF2s2ioGKK8u3OilPGxDQCtrcc+TJAX9pN\ndaX/vNi6ZxxPwBQx9HctryxB3cc=\n-----END CERTIFICATE-----\n'],
                privateKey: undefined
            };

            const options = { keyFormat: 'pkcs8', importPassword: '' };
            assert.deepStrictEqual(certUtil.parsePkcs12(certificate, options), expected);
        });

        it('should parse pkcs12 with openssl-legacy key format', () => {
            const certificate = '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';

            const expected = ['-----BEGIN CERTIFICATE-----\nMIICjTCCAfagAwIBAgIBATANBgkqhkiG9w0BAQUFADBpMRQwEgYDVQQDEwtleGFt\ncGxlLm9yZzELMAkGA1UEBhMCVVMxETAPBgNVBAgTCFZpcmdpbmlhMRMwEQYDVQQH\nEwpCbGFja3NidXJnMQ0wCwYDVQQKEwRUZXN0MQ0wCwYDVQQLEwRUZXN0MB4XDTE4\nMTEzMDIwMzkzNloXDTE5MTEzMDIwMzkzNlowaTEUMBIGA1UEAxMLZXhhbXBsZS5v\ncmcxCzAJBgNVBAYTAlVTMREwDwYDVQQIEwhWaXJnaW5pYTETMBEGA1UEBxMKQmxh\nY2tzYnVyZzENMAsGA1UEChMEVGVzdDENMAsGA1UECxMEVGVzdDCBnzANBgkqhkiG\n9w0BAQEFAAOBjQAwgYkCgYEAjRR85S0Hf9UmEvFJHQMMqmZD97CQxzfmV0L6aMIi\nD9peSJrNOQcwm+KE7FIulQDJm7177yGRuAuiSKQaoUnUT6N3CiEhRKBD8hfD4ckF\nlpRtr/gUiKobmXP5uTip5oQ4mwx5NVduCheWOCnqFKEGcSFuHafLp56OEAmSFSqN\ndtcCAwEAAaNFMEMwDAYDVR0TBAUwAwEB/zALBgNVHQ8EBAMCAvQwJgYDVR0RBB8w\nHYYbaHR0cDovL2V4YW1wbGUub3JnL3dlYmlkI21lMA0GCSqGSIb3DQEBBQUAA4GB\nADiUCh8gTaMFgiG6R5ocAxPKTREbSbEybb5EsGP8lggevlZZtsGoh20LwLpn9l4v\nlO1NrfXQXy5qzgvBhiWdFZGor7w7iFcLnrXcmI50I841zXPA3Hwt2GFMfb77HiSH\nJOEOfGLEfgLgDoB/eKCzc3VQWj0ETVnRK7kMwnlNtgGE\n-----END CERTIFICATE-----\n'];

            const options = { keyFormat: 'openssl-legacy', importPassword: 'password' };
            const results = certUtil.parsePkcs12(certificate, options);

            assert.deepStrictEqual(results.certificates, expected);
            // Private key results change every run. At least verify header and footer
            assert.strictEqual(results.privateKey.startsWith('-----BEGIN RSA PRIVATE KEY-----\n'), true);
            assert.strictEqual(results.privateKey.endsWith('-----END RSA PRIVATE KEY-----\n'), true);
        });

        it('should parse pkcs12 with pkcs8 key format', () => {
            const certificate = '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';

            const expected = ['-----BEGIN CERTIFICATE-----\nMIIEBTCCAu2gAwIBAgIUIQIgD80WtFg+PUbIyPtFfrRtFTMwDQYJKoZIhvcNAQEL\nBQAwgZExCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJXQTEQMA4GA1UEBwwHU2VhdHRs\nZTENMAsGA1UECgwEVGVzdDEcMBoGA1UECwwTUHJvZHVjdCBEZXZlbG9wbWVudDEP\nMA0GA1UEAwwGbXlfc3NsMSUwIwYJKoZIhvcNAQkBFhZzb21lYm9keUBzb21ld2hl\ncmUuY29tMB4XDTIxMDIxNjAxMzk1NloXDTMxMDIxNDAxMzk1NlowgZExCzAJBgNV\nBAYTAlVTMQswCQYDVQQIDAJXQTEQMA4GA1UEBwwHU2VhdHRsZTENMAsGA1UECgwE\nVGVzdDEcMBoGA1UECwwTUHJvZHVjdCBEZXZlbG9wbWVudDEPMA0GA1UEAwwGbXlf\nc3NsMSUwIwYJKoZIhvcNAQkBFhZzb21lYm9keUBzb21ld2hlcmUuY29tMIIBIjAN\nBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyBYlVkiQ5EviraYYHYLnMg6zL5nv\naGeF7oprkUhVdyB4rgHNSsTxgbzdhchzXLaeoDoawz3iAbFStgHAsY/akX5NefBZ\nQJv3Oe9gklNyKFjAETynbW9/8tCDRyQ5q2f3KR/KRhDM7zhgLXcfzJl/TAPRTksQ\nRjXyZpqbyw4A9/elAFeC5BQnjKIsxBdjoeGUc8XqP4D+oTNvguLvhHhvDEvn+oAc\nKrGi2ks/hGJOqvQodvIgtg9ZuV/2kMg5WzbSG4oODynH6Balg+688EtbMc6H5e3U\nsSOBqFRl1zd+vxbv3c4+FNrho6lDAYDDVB82g3DZwW490ytAAQU3QQ0FcQIDAQAB\no1MwUTAdBgNVHQ4EFgQU6nPNF64PUxci6W6e255coHOiQdwwHwYDVR0jBBgwFoAU\n6nPNF64PUxci6W6e255coHOiQdwwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0B\nAQsFAAOCAQEAaaqm8RXGZAHnY1yoPZ2AJjxTW+j1JAIa5Np6/nONyZwqQ+E7xtjk\ngHD9tdZK4oGL0sE81MoVcxBs79CLv6ig7gIiGYzbGwm7JplKWLggtSdKF57/Vqm5\n4VSn4+aLqs1LE46WjhxNO2Oz4JLS3jWXMY69vCslCrhtc6wyzwOFO16LOPgR+qay\nc8tPP+5ttIbEZ7/r8rnNEONRodAzMeuVVqqNBcPovVd3qy2hn7XkrD/xj8V0i/QZ\npzdjdAtKSStqVQPD309zGPOvBsoFy1HxPZ6ReCqJRHyprJ4dIFQkjJPfxPTwKFK3\nt/1gf9juz4CHsHK9rQjiThztKKrdG49TSA==\n-----END CERTIFICATE-----\n'];

            const options = { keyFormat: 'pkcs8', importPassword: 'password' };
            const results = certUtil.parsePkcs12(certificate, options);

            assert.deepStrictEqual(results.certificates, expected);
            // Private key results change every run. At least verify header and footer
            assert.strictEqual(results.privateKey.startsWith('-----BEGIN ENCRYPTED PRIVATE KEY-----\n'), true);
            assert.strictEqual(results.privateKey.endsWith('-----END ENCRYPTED PRIVATE KEY-----\n'), true);
        });

        it('should parse pkcs12 with no password', () => {
            const certificate = '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';

            const expected = {
                certificates: ['-----BEGIN CERTIFICATE-----\nMIIDRjCCAi6gAwIBAgIBATALBgkqhkiG9w0BAQswODE2MAkGA1UEBhMCVVMwKQYD\nVQQDHiIAUABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzMB4XDTEzMDEz\nMTIxMDAwMFoXDTE2MDEzMTIxMDAwMFowODE2MAkGA1UEBhMCVVMwKQYDVQQDHiIA\nUABlAGMAdQBsAGkAYQByACAAVgBlAG4AdAB1AHIAZQBzMIIBIjANBgkqhkiG9w0B\nAQEFAAOCAQ8AMIIBCgKCAQEA4qEnCuFxZqTEM/8cYcaYxexT6+fAHan5/eGCFOe1\nYxi0BjRuDooWBPX71+hmWK/MKrKpWTpA3ZDeWrQR2WIcaf/ypd6DAEEWWzlQgBYp\nEUj/o7cykNwIvZReU9JXCbZu0EmeZXzBm1mIcWYRdk17UdneIRUkU379wVJcKXKl\ngZsx8395UNeOMk11G5QaHzAafQ1ljEKB/x2xDgwFxNaKpSIq3LQFq0PxoYt/PBJD\nMfUSiWT5cFh1FdKITXQzxnIthFn+NVKicAWBRaSZCRQxcShX6KHpQ1Lmk0/7QoCc\nDOAmVSfUAaBl2w8bYpnobFSStyY0RJHBqNtnTV3JonGAHwIDAQABo10wWzAMBgNV\nHRMEBTADAQH/MAsGA1UdDwQEAwIA/zAdBgNVHQ4EFgQU5QmA6U960XL4SII2SEhC\ncxij0JYwHwYDVR0jBBgwFoAU5QmA6U960XL4SII2SEhCcxij0JYwDQYJKoZIhvcN\nAQELBQADggEBACKRCWzcuFjythAJn7yNet1pFNjcvkndLbHOgCh+QSdA3M0wKVpa\ntltj8pD6AbbkwgXA85Zmf+5hQoHaPTIdNEw8QCn+/nBrBKozYGR2eQY/ivkS3H2l\n7eaiDbE1QGpJ6ik022jtCBXSjXJge24wpCE0DNwUHUIbPbn6Ve/xW65TU+hg2tOO\nKmuSMsOA+6s1dSNSH0BmXTr4JqSh7vksSS5pkq4FAgw0skVwzZlIr9AABojQTUOi\n9ywJy1bzH/pCTl9jA27SNwh2eD13MphfK3NXnf44bF0rmaV3IEGTK9Ots7xtbBhP\ndz7B4HWG42mCelEckozPnFWPRtt2ceKvq5w=\n-----END CERTIFICATE-----\n'],
                privateKey: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA4qEnCuFxZqTEM/8cYcaYxexT6+fAHan5/eGCFOe1Yxi0BjRu\nDooWBPX71+hmWK/MKrKpWTpA3ZDeWrQR2WIcaf/ypd6DAEEWWzlQgBYpEUj/o7cy\nkNwIvZReU9JXCbZu0EmeZXzBm1mIcWYRdk17UdneIRUkU379wVJcKXKlgZsx8395\nUNeOMk11G5QaHzAafQ1ljEKB/x2xDgwFxNaKpSIq3LQFq0PxoYt/PBJDMfUSiWT5\ncFh1FdKITXQzxnIthFn+NVKicAWBRaSZCRQxcShX6KHpQ1Lmk0/7QoCcDOAmVSfU\nAaBl2w8bYpnobFSStyY0RJHBqNtnTV3JonGAHwIDAQABAoIBAQDTDtX3ciFUQFph\nOlLKVFPu77rwVjI67hPddujYYzowAc+Wf7mHXN5I3HUgjFTUf1Qa56yDZpcGQWZy\n/oQo+RARP8ZQ5zsFP5h8eJIZ14mDiYJai8BR3DlfpQ977MYWS4pD/GvBhEAiV22U\nfkQA8wPIJKiUEsZz5C6angMqrpSob4kNpatmcXglyPomb1EUD00pvOvrMwpcIM69\nrlujUpTSinnixzCC3neJq8GzzncobrZ6r1e/RlGB98mHc2xG28ORjmre+/sTy7d9\n3Hywi+6YOZRg6yhKJruldXeSpgTob9CvIBjyn8T66XlBuZ9aufJP9qLgosgGilqV\naDlpp28xAoGBAP1MwBmdjfGBPpAvOTZdMEKH/llZvkVA7L+gty9rz1IbdxsJ28Uk\nzJePjYsWwlhuOrnVYbDNse2c2GNXgey7ZwZ4712U2FOMKmbRkf/l9kcOaLvqFpte\nvzoHBLhYz9s6ULa/a/26SocgVfiHUp4Jy8tNEbnihlC+p77XnEZJRIUNAoGBAOUL\nnpPnNdqjLa5oOc5xz0Au7ronmUc1C/Y05ULbmTOZuAdwHwfzf9KiEEtOjx0tYo3h\n0PUsRJhu9sHmplGAtEj4vBsSYqBc2iRA1YrdEWt/IH9Al0L3GE9Fw9QsGP5vow1w\n1i+S9QgiK+tAMzYzN1hHxjuFR2jbKL1S59Rb8ubbAoGBAOGThFBLm6lDrG/DXnQn\nsV7OtZjk7ynFlBFkEz9MB6nbg8q0kN+U0g73bNo9Pn56TBpLCWDnDlnJoHt35uDo\nU+vTr3fromtlHC3M3PTD2vuUvXj8E33yduI6dd2mWhWmbVMSTh371XtZNLbL7KuJ\nldBLpkmgjnVCFSlD4oxFm5vRAoGAaRWvp8QInUsIhmAjRWhJ4fSmapoIZPcdidQy\n6z29SENaf28djZRWLNlWCHb+ijBsaxQTvqiUwCsI42VjITmffWtBQlppDZIMM13b\nm15Zw6wLyNZlj7+2U4h6lDm3LeUiNeRzIFiYOycSZ1iJJnDRD5u+g0hevujuBA6p\ndnDJPMkCgYBea6I/pfdJX8CJq+ldTSaNyeVQovcE0+cfXpz2PVkXH0skY6lOyVsu\nodAviavgGAMa5EFY0Lr9QDoTvFIXOmpjORQPoH4ORyij58Ljnu6+wePCxRfHkY2E\nbR5q0FKxWNIx+jvrddnRECPu6hPkn31EnLGVgkRF+0GBCv7bs57/1A==\n-----END RSA PRIVATE KEY-----\n'
            };

            const options = { keyFormat: 'pkcs8' };
            assert.deepStrictEqual(certUtil.parsePkcs12(certificate, options), expected);
        });
    });
});