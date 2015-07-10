var should = require('chai').should(),
    sinon = require('sinon'),
    mandrill = require('mandrill-api/mandrill'),
    proxyquire = require('proxyquire')

describe('#sendTemplate', function() {

    var sandbox;
    var sendTemplateStub
    var sendMandrillTemplate;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();

        sendTemplateStub = sandbox.stub().yields();

        function MockMandrill(key) {
            this.messages = {
                sendTemplate: sendTemplateStub
            }

            this.apikey = key;
        }

        var defaults = {
            replyTo: 'hello@domain.com'
        };

        sendMandrillTemplate = new(proxyquire('../', {
            'mandrill-api/mandrill': {
                Mandrill: MockMandrill
            }
        }))('testapikey', defaults);
    })

    afterEach(function() {
        sandbox.restore();
    })

    it('mandrill client has passed in api key', function() {
        sendMandrillTemplate.mandrill_client.apikey.should.equal('testapikey')
    });

    it('calls mandrill client with template name', function(done) {
        sendMandrillTemplate.sendTemplate(
            'template-name',
            'a@b.com', {
                'a': 1
            },
            function() {

                sinon.assert.calledWith(sendTemplateStub, sinon.match({
                    template_name: 'template-name'
                }));

                done();
            })
    });

    it('calls mandrill client with template name', function(done) {
        sendMandrillTemplate.sendTemplate(
            'template-name',
            'a@b.com', {
                'a': 1
            },
            function() {

                sinon.assert.calledWith(sendTemplateStub, sinon.match({
                    template_name: 'template-name'
                }));

                done();
            })
    });

    it('message contains to email address if specified as a string', function(done) {

        sendMandrillTemplate.sendTemplate(
            'template-name',
            'a@b.com', {
                'a': 1
            },
            function() {
                sinon.assert.calledWith(sendTemplateStub, sinon.match({
                    message: sinon.match({
                        to: [{
                            email: 'a@b.com'
                        }]
                    })
                }));

                done();
            })
    });

    it('message contains to email address if specified in emailAddresses object', function(done) {

        sendMandrillTemplate.sendTemplate(
            'template-name', {
                to: 'a@b.com'
            }, {
                'a': 1
            },
            function() {
                sinon.assert.calledWith(sendTemplateStub, sinon.match({
                    message: sinon.match({
                        to: [{
                            email: 'a@b.com'
                        }]
                    })
                }));

                done();
            })
    });

    it('returns error if to address is not specified', function(done) {

        sendMandrillTemplate.sendTemplate(
            'template-name', {}, {
                'a': 1
            },
            function(err) {
                sinon.assert.notCalled(sendTemplateStub)
                should.exist(err)
                err.name.should.equal('No_To_Address')
                err.message.should.equal('No to address specified')

                done();
            })
    });

    it('has reply to address set by default', function(done) {
        sendMandrillTemplate.sendTemplate(
            'template-name', {
                to: 'a@b.com'
            }, {
                'a': 1
            },
            function() {
                sinon.assert.calledWith(sendTemplateStub, sinon.match({
                    message: sinon.match({
                        headers: {
                            'Reply-To': 'hello@domain.com'
                        }
                    })
                }));

                done();
            })
    });

    it('can specify reply-to address', function(done) {
        sendMandrillTemplate.sendTemplate(
            'template-name', {
                to: 'a@b.com',
                replyTo: '1@2.com'
            },
            function() {
                sinon.assert.calledWith(sendTemplateStub, sinon.match({
                    message: sinon.match({
                        headers: {
                            'Reply-To': '1@2.com'
                        }
                    })
                }));

                done();
            })
    });

    it('can specify bcc address', function(done) {
        sendMandrillTemplate.sendTemplate(
            'template-name', {
                to: 'a@b.com',
                bcc: 'x@y.com'
            },
            function() {
                sinon.assert.calledWith(sendTemplateStub, sinon.match({
                    message: sinon.match({
                        bcc_address: 'x@y.com'
                    })
                }));

                done();
            })
    });

    it('message contains merge_vars if specified', function(done) {
        sendMandrillTemplate.sendTemplate(
            'template-name',
            'a@ba.com', {
                a: 1,
                abc: 'xyz'
            },
            function() {

                //must be a better way of asserting
                ////looked at sinon.match, but too recursive i think?

                var vars = sendTemplateStub.args[0][0].message.merge_vars[0].vars;

                should.exist(vars[0])
                vars[0].name.should.equal('a')
                vars[0].content.should.equal(1)

                should.exist(vars[1])
                vars[1].name.should.equal('abc')
                vars[1].content.should.equal('xyz')

                done();
            })
    });

    it('do not have to specify merge_vars', function(done) {
        sendMandrillTemplate.sendTemplate(
            'template-name',
            'a@ba.com',
            function() {
                sinon.assert.calledOnce(sendTemplateStub);
                done();
            })
    });
});
