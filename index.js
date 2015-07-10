var _ = require('lodash'),
    mandrill = require('mandrill-api/mandrill');

function MandrillTemplateSender(apikey, defaults) {
    if (!apikey)
        throw new Error('Mandrill API key required');

    if (defaults) {
        this.defaults = defaults
    } else {
        this.defaults = {};
    }

    this.mandrill_client = new mandrill.Mandrill(apikey);
}

MandrillTemplateSender.prototype.sendTemplate = function(templateName, emailAddresses, variables, callback) {

    if (typeof variables == 'function')
        callback = variables;

    var _emailAddresses = {};

    if (typeof emailAddresses == 'string') {
        _emailAddresses.to = emailAddresses
    }

    if (typeof emailAddresses == 'object') {
        _emailAddresses = _.assign(this.defaults, emailAddresses)
    }

    if (!_emailAddresses.to)
        return callback({
            name: 'No_To_Address',
            message: 'No to address specified'
        })

    var message = {
        to: [{
            email: _emailAddresses.to,
        }],

        headers: {
            'Reply-To': _emailAddresses.replyTo
        },

        track_opens: true,

        merge: true,

        merge_vars: [{
            rcpt: _emailAddresses.to,
            vars: []
        }],
    };

    if (_emailAddresses.bcc) {
        message.bcc_address = _emailAddresses.bcc
    }

    Object.keys(variables).forEach(function(variableKey) {
        message.merge_vars[0].vars.push({
            name: variableKey,
            content: variables[variableKey]
        })
    })

    this.mandrill_client.messages.sendTemplate({
        template_name: templateName,
        template_content: [],
        message: message,
    }, function(result) {
        //log result console.log(result);
        return callback();

    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
        callback(e)
    });
}

module.exports = MandrillTemplateSender
