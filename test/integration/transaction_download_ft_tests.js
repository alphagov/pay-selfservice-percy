process.env.SESSION_ENCRYPTION_KEY = 'naskjwefvwei72rjkwfmjwfi72rfkjwefmjwefiuwefjkbwfiu24fmjbwfk';

var request         = require('supertest');
var portfinder      = require('portfinder');
var nock            = require('nock');
var _app             = require(__dirname + '/../../server.js').getApp;
var querystring     = require('querystring');
var paths           = require(__dirname + '/../../app/paths.js');
var winston         = require('winston');
var session     = require(__dirname + '/../test_helpers/mock_session.js');
var assert      = require('chai').assert;

var gatewayAccountId = 651342;
var app = session.mockValidAccount(_app, gatewayAccountId);

portfinder.getPort(function (err, connectorPort) {
  var CHARGES_API_PATH = '/v1/api/accounts/' + gatewayAccountId + '/charges';
  var localServer = 'http://localhost:' + connectorPort;
  var connectorMock = nock(localServer, {
    reqheaders: {
      'Accept': 'application/json'
    }
  });

  function connectorMock_responds(code, data, searchParameters) {
    var queryStr = '?';
    queryStr += 'reference=' + (searchParameters.reference ? searchParameters.reference : '') +
      '&state=' + (searchParameters.state ? searchParameters.state : '') +
      '&from_date=' + (searchParameters.fromDate ? searchParameters.fromDate : '') +
      '&to_date=' + (searchParameters.toDate ? searchParameters.toDate : '') +
      '&page=' + (searchParameters.page ? searchParameters.page : 1) +
      '&display_size=' + (searchParameters.pageSize ? searchParameters.pageSize : 100);

    return connectorMock.get(CHARGES_API_PATH + queryStr)
      .reply(code, data);
  }

  function download_transaction_list(query) {
    return request(app)
      .get(paths.transactions.download + "?" + querystring.stringify(query))
      .set('Accept', 'application/json');
  }

  describe('Transaction download endpoints', function () {

    beforeEach(function () {
      process.env.CONNECTOR_URL = localServer;
      nock.cleanAll();
    });

    before(function () {
      // Disable logging.
      winston.level = 'none';
    });

    describe('The /transactions/download endpoint', function () {

      it('should download a csv file comprising a list of transactions for the gateway account', function (done) {

        mockJson = {
          results: [{
            amount: 12345,
            state: {status: 'succeeded', finished: false},
            description: 'desc-red',
            reference: 'red',
            links: [],
            charge_id: 'charge1',
            gateway_transaction_id: 'transaction-1',
            return_url: 'https://demoservice.pymnt.localdomain:443/return/red',
            payment_provider: 'sandbox',
            created_date: '2016-05-12T16:37:29.245Z'
          },
            {
              amount: 999,
              state: {status: 'canceled', finished: true, code: 'P01234', message: 'Something happened'},
              description: 'desc-blue',
              reference: 'blue',
              links: [],
              charge_id: 'charge2',
              gateway_transaction_id: 'transaction-2',
              return_url: 'https://demoservice.pymnt.localdomain:443/return/blue',
              payment_provider: 'worldpay',
              created_date: '2015-04-12T18:55:29.999Z'
            }
          ]
        };

        connectorMock_responds(200, mockJson, {});

        download_transaction_list()
          .expect(200)
          .expect('Content-Type', 'text/csv; charset=utf-8')
          .expect('Content-disposition', /attachment; filename=GOVUK Pay \d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d.csv/)
          .expect(function (res) {
            var csvContent = res.text;
            var arrayOfLines = csvContent.split("\n");
            assert(3, arrayOfLines.length);
            assert.equal('Reference,Amount,State,Finished,Error Code,Error Message,Gateway Transaction ID,GOV.UK Pay ID,Date Created', arrayOfLines[0]);
            assert.equal('red,123.45,succeeded,false,,,transaction-1,charge1,12 May 2016 — 17:37:29', arrayOfLines[1]);
            assert.equal('blue,9.99,canceled,true,P01234,Something happened,transaction-2,charge2,12 Apr 2015 — 19:55:29', arrayOfLines[2]);
          })
          .end(done);
      });

      it('should download a csv file comprising a list of transactions for the gateway account and the given filter', function (done) {

        connectorMock_responds(200, 'csv data', {
          reference: 'ref',
          state: '1234',
          fromDate: '2016-01-11T13%3A04%3A45.000Z',
          toDate: '2016-01-11T14%3A04%3A46.000Z',
          page: 1,
          display_size: 100
        });

        download_transaction_list({
          reference: 'ref',
          state: '1234',
          fromDate: '11/01/2016',
          fromTime: '13:04:45',
          toDate: '11/01/2016',
          toTime: '14:04:45'
        })
          .expect(200)
          .expect('Content-Type', 'text/csv; charset=utf-8')
          .expect('Content-disposition', /attachment; filename=GOVUK Pay \d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d.csv/)
           .expect(function (res) {
              var csvContent = res.text;
              var arrayOfLines = csvContent.split("\n");
              assert.equal(1, arrayOfLines.length);
          })
          .end(done);
      });

      it('should show error message on a bad request', function (done) {

        var errorMessage = 'Unable to download list of transactions.';
        connectorMock_responds(400, {'message': errorMessage}, {});

        download_transaction_list()
          .expect(200, {'message': 'Internal server error'})
          .end(done);

      });

      it('should show a generic error message on a connector service error.', function (done) {

        connectorMock_responds(500, {'message': 'some error from connector'}, {});

        download_transaction_list()
          .expect(200, {'message': 'Internal server error'})
          .end(done);
      });

      it('should show internal error message if any error happens while retrieving the list from connector', function (done) {
        // No connectorMock defined on purpose to mock a network failure

        download_transaction_list()
          .expect(200, {'message': 'Internal server error'})
          .end(done);
      });
    });
  });
});
