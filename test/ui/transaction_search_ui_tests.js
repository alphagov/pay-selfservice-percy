require(__dirname + '/../test_helpers/html_assertions.js');
var should = require('chai').should();

var renderTemplate = require(__dirname + '/../test_helpers/html_assertions.js').render;

describe('The transaction list view', function () {
    it('should render all transactions', function () {

        var templateData = {
            'total': 2,
            'results': [
                {
                    'charge_id': '100',
                    'email': 'example1@mail.fake',
                    'amount': '50.00',
                    'reference': 'ref1',
                    'state_friendly': 'Testing2',
                    'state': {
                      'status': 'testing2',
                      'finished': true
                    },
                    'created': '2016-01-11 01:01:01'
                },
                {
                    'charge_id': '101',
                    'email': 'example2@mail.fake',
                    'amount': '20.00',
                    'reference': 'ref1',
                    'state_friendly': 'Testing2',
                    'state': {
                      'status': 'testing2',
                      'finished': false
                    },
                    'created': '2016-01-11 01:01:01'
                }
            ],
            'filters': {'reference': 'ref1', 'state': 'Testing2', 'fromDate': '2015-01-11 01:01:01', 'toDate': '2015-01-11 01:01:01'},
            'hasResults': true,
            'downloadTransactionLink':
                '/transactions/download?reference=ref1&state=Testing2&from_date=2%2F0%2F2015%2001%3A01%3A01&&to_date=2%2F0%2F2015%2001%3A01%3A01'
        };

        var body = renderTemplate('transactions/index', templateData);

        body.should.containSelector('#download-transactions-link').withAttribute('href', templateData.downloadTransactionLink);

        templateData.results.forEach(function (transactionData, ix) {
            body.should.containSelector('h3#total-results').withExactText('\n  2 transactions\n    from 2015-01-11 01:01:01\n    to 2015-01-11 01:01:01\n    with \'Testing2\' state\n');
            body.should.containInputField('reference', 'text').withAttribute('value', 'ref1');
            body.should.containInputField('fromDate', 'text').withAttribute('value', '2015-01-11 01:01:01');
            body.should.containSelector('table#transactions-list')
                .havingRowAt(ix + 1)
                .withTableDataAt(1, templateData.results[ix].reference)
                .withTableDataAt(2, templateData.results[ix].email)
                .withTableDataAt(3, "£" + templateData.results[ix].amount)
                .withTableDataAt(4, templateData.results[ix].state_friendly)
                .withTableDataAt(5, templateData.results[ix].created);
        });
    });

    it('should render no transactions', function () {

        var templateData = {
            'results': [],
            'hasResults': false
        };

        var body = renderTemplate('transactions/index', templateData);

        body.should.not.containSelector('#download-transactions-link');

        templateData.results.forEach(function (transactionData, ix) {
            body.should.containSelector('p#no-results').withExactText('No results match the search criteria.');
        });
    });
});
