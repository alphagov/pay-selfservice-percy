var should = require('chai').should();
var renderTemplate = require(__dirname + '/utils/html_assertions.js').render;

describe('The credentials view in normal mode', function () {

  it('should display credentials view for a worldpay account', function () {

    var templateData = {
      "payment_provider": "Worldpay",
      "account_id": "1",
      "credentials": {
        'username': 'a-username',
        'merchant_id': 'a-merchant-id'
      }
    };

    var body = renderTemplate('provider_credentials/worldpay', templateData);

    body.should.containSelector('div#account-id').withAttribute("class", "hidden").withText(1);
    body.should.containSelector('h2#view-title').withExactText('Your Worldpay Credentials');

    body.should.containSelector('a#edit-credentials-link')
      .withAttribute("class", "button")
      .withAttribute("href", "/selfservice/credentials/1?edit")
      .withText("Edit credentials");

    body.should.containSelector('dl#credentials');

    body.should.containSelector('dt#merchant-id-key').withExactText('Merchant ID');
    body.should.containSelector('dd#merchant-id-value').withExactText('a-merchant-id');

    body.should.containSelector('dt#username-key').withExactText('Username');
    body.should.containSelector('dd#username-value').withExactText('a-username');

    body.should.containSelector('dt#password-key').withExactText('Password');
    body.should.containSelector('dd#password-value').withExactText('****');
  });

  it('should display credentials view for a smartpay account', function () {

    var templateData = {
      "payment_provider": "Smartpay",
      "account_id": "1",
      "credentials": {
        'username': 'a-username'
      }
    };

    var body = renderTemplate('provider_credentials/smartpay', templateData);

    body.should.containSelector('div#account-id').withAttribute("class", "hidden").withText(1);
    body.should.containSelector('h2#view-title').withExactText('Your Smartpay Credentials');

    body.should.containSelector('a#edit-credentials-link')
      .withAttribute("class", "button")
      .withAttribute("href", "/selfservice/credentials/1?edit")
      .withText("Edit credentials");

    body.should.containSelector('dl#credentials');

    body.should.not.containSelector('dt#merchant-id-key');
    body.should.not.containSelector('dd#merchant-id-value');

    body.should.containSelector('dt#username-key').withExactText('Username');
    body.should.containSelector('dd#username-value').withExactText('a-username');

    body.should.containSelector('dt#password-key').withExactText('Password');
    body.should.containSelector('dd#password-value').withExactText('****');
  });

  it('should display credentials view for a sandbox account', function () {

    var templateData = {
      "payment_provider": "Sandbox",
      "account_id": "1",
      "credentials": {}
    };

    var body = renderTemplate('provider_credentials/sandbox', templateData);

    body.should.containSelector('div#account-id').withAttribute("class", "hidden").withText(1);
    body.should.containSelector('h2#view-title').withExactText('Your Sandbox Credentials');
    body.should.containSelector('div#message').withExactText('This is a sandbox account');

    body.should.not.containSelector('a#edit-credentials-link');

    body.should.not.containSelector('dl#credentials');

    body.should.not.containSelector('dt#merchant-id-key');
    body.should.not.containSelector('dd#merchant-id-value');

    body.should.not.containSelector('dt#username-key');
    body.should.not.containSelector('dd#username-value');

    body.should.not.containSelector('dt#password-key');
    body.should.not.containSelector('dd#password-value');
  });
});


describe('The credentials view in edit mode', function () {

  it('should display credentials view for a worldpay account', function () {

    var templateData = {
      "payment_provider": "Worldpay",
      "account_id": "1",
      "credentials": {
        'username': 'a-username',
        'merchant_id': 'a-merchant-id'
      },
      'editMode': 'true'
    };

    var body = renderTemplate('provider_credentials/worldpay', templateData);

    body.should.containSelector('div#account-id').withAttribute("class", "hidden").withText(1);
    body.should.containSelector('h2#view-title').withExactText('Your Worldpay Credentials');

    body.should.containSelector('form#credentials-form')
      .withAttribute('method', 'post')
      .withAttribute('action', '/selfservice/credentials/1');

    body.should.not.containSelector('a#edit-credentials-link');

    body.should.containInputField('merchantId', 'text')
      .withAttribute('value', 'a-merchant-id')
      .withLabel('Merchant ID');

    body.should.containInputField('username', 'text')
      .withAttribute('value', 'a-username')
      .withLabel('Username');

    body.should.containInputField('password', 'password')
      .withAttribute('value', '')
      .withLabel('Password');

    body.should.containInputField('submitCredentials', 'submit');

  });

  it('should display credentials view for a smartpay account', function () {

    var templateData = {
      "payment_provider": "Smartpay",
      "account_id": "1",
      "credentials": {
        'username': 'a-username',
        'merchant_id': 'a-merchant-id'
      },
      'editMode': 'true'
    };

    var body = renderTemplate('provider_credentials/smartpay', templateData);

    body.should.containSelector('div#account-id').withAttribute("class", "hidden").withText(1);
    body.should.containSelector('h2#view-title').withExactText('Your Smartpay Credentials');

    body.should.containSelector('form#credentials-form')
      .withAttribute('method', 'post')
      .withAttribute('action', '/selfservice/credentials/1');

    body.should.not.containSelector('a#edit-credentials-link');

    body.should.not.containSelector('input#merchant-id');

    body.should.containInputField('username', 'text')
      .withAttribute('value', 'a-username')
      .withLabel('Username');

    body.should.containInputField('password', 'password')
      .withAttribute('value', '')
      .withLabel('Password');

    body.should.containInputField('submitCredentials', 'submit');
  });

  it('should display credentials view for a sandbox account', function () {

    var templateData = {
      "payment_provider": "Sandbox",
      "account_id": "1",
      "credentials": {},
      'editMode': 'true'
    };

    var body = renderTemplate('provider_credentials/sandbox', templateData);

    body.should.containSelector('div#account-id').withAttribute("class", "hidden").withText(1);
    body.should.containSelector('h2#view-title').withExactText('Your Sandbox Credentials');
    body.should.containSelector('div#message').withExactText('This is a sandbox account');

    body.should.not.containSelector('form#credentials-form');
    body.should.not.containSelector('a#edit-credentials-link');
    body.should.not.containSelector('input#submitCredentials');
  });

});
