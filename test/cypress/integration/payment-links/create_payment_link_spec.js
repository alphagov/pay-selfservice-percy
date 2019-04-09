const commonStubs = require('../../utils/common_stubs')
const userExternalId = 'a-user-id'
const gatewayAccountId = 42

describe('The create payment link flow', () => {
  beforeEach(() => {
    cy.task('setupStubs', [
      commonStubs.getUserStub(userExternalId, [gatewayAccountId]),
      commonStubs.getGatewayAccountStub(gatewayAccountId, 'test', 'worldpay')
    ])
    Cypress.Cookies.preserveOnce('session', 'gateway_account')
  })

  describe('A English payment link', () => {
    const name = 'Pay for a parking permit'
    const description = 'Finish your application'
    const referenceName = 'invoice number'
    const referenceHint = 'Found in the email'
    const amount = 10

    describe('The create payment link start page', () => {
      it('Should display page content', () => {
        cy.setEncryptedCookies(userExternalId, gatewayAccountId)
        cy.visit('/create-payment-link')

        cy.get('h1').should('contain', 'Create a payment link')
        cy.get('a#create-payment-link').should('exist')
      })
      it('Should navigate to create payment link in English information page', () => {
        cy.setEncryptedCookies(userExternalId, gatewayAccountId)
        cy.visit('/create-payment-link')

        cy.get('a#create-payment-link').click()

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/create-payment-link/information`)
        })
      })
    })

    describe('Information page', () => {
      it('Should display instructions for an English payment link', () => {
        cy.get('h1').should('contain', 'Set payment link information')

        cy.get('form[method=post][action="/create-payment-link/information"]').should('exist')
          .within(() => {
            cy.get('input#payment-link-title').should('exist')
            cy.get('input#payment-link-title').should('have.attr', 'lang', 'en')
            cy.get('label[for="payment-link-title"]').should('contain', 'Title')
            cy.get('input#payment-link-title').parent('.govuk-form-group').get('span')
              .should('contain', 'For example, “Pay for a parking permit”')

            cy.get('textarea#payment-link-description').should('exist')
            cy.get('textarea#payment-link-description').should('have.attr', 'lang', 'en')
            cy.get('label[for="payment-link-description"]').should('exist')
            cy.get('textarea#payment-link-description').parent('.govuk-form-group').get('span')
              .should('contain', 'Give your users more information.')

            cy.get('button[type=submit]').should('exist')
          })
      })

      it('Should continue to the reference page', () => {
        cy.get('form[method=post][action="/create-payment-link/information"]').within(() => {
          cy.get('input#payment-link-title').type(name)
          cy.get('textarea#payment-link-description').type(description)
          cy.get('button[type=submit]').click()
        })

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/create-payment-link/reference`)
        })
      })
    })

    describe('Reference page', () => {
      it('should have instructions for an English patment link when "yes" is selected', () => {
        cy.get('h1').should('contain', 'Do your users already have a payment reference?')

        cy.get('form[method=post][action="/create-payment-link/reference"]').should('exist')
          .within(() => {
            cy.get('input[type=radio]#reference-type-custom').should('exist')
            cy.get('input[type=radio]#reference-type-standard').should('exist')
            cy.get('input[type=radio]#reference-type-custom').click()

            cy.get('input#reference-label').should('exist')
            cy.get('input#reference-label').should('have.attr', 'lang', 'en')
            cy.get('input#reference-label').parent('.govuk-form-group').get('span')
              .should('contain', 'For example, “invoice number”')

            cy.get('textarea#reference-hint-text').should('exist')
            cy.get('textarea#reference-hint-text').should('have.attr', 'lang', 'en')
            cy.get('textarea#reference-hint-text').parent('.govuk-form-group').get('span')
              .should('contain', 'Tell users what the')

            cy.get('button[type=submit]').should('exist')
          })
      })

      it('should continue to the amount page', () => {
        cy.get('form[method=post][action="/create-payment-link/reference"]').should('exist')
          .within(() => {
            cy.get('input#reference-label').type(referenceName)
            cy.get('textarea#reference-hint-text').type(referenceHint)
            cy.get('button[type=submit]').click()
          })

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/create-payment-link/amount`)
        })
      })
    })

    describe('Amount page', () => {
      it('should display content', () => {
        cy.get('form[method=post][action="/create-payment-link/amount"]').should('exist')
          .within(() => {
            cy.get('input[type=radio]#amount-type-fixed').should('exist')
            cy.get('input[type=radio]#amount-type-variable').should('exist')
            cy.get('input#payment-amount').should('exist')
            cy.get('button[type=submit]').should('exist')
          })
      })

      it('should continue to the confirm page', () => {
        cy.get('form[method=post][action="/create-payment-link/amount"]').should('exist')
          .within(() => {
            cy.get('input[type=radio]#amount-type-fixed').click()
            cy.get('input#payment-amount').type(amount)
            cy.get('button[type=submit]').click()
          })

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/create-payment-link/review`)
        })
      })
    })

    describe('Review page', () => {
      it('should display entered values', () => {
        cy.get('dl').find('div').eq(0).should('exist').within(() => {
          cy.get('dt').should('contain', 'Title')
          cy.get('dd.cya-answer').should('contain', name)
          cy.get('dd.cya-change > a').should('have.attr', 'href', '/create-payment-link/information?field=payment-link-title')
        })
        cy.get('dl').find('div').eq(1).should('exist').within(() => {
          cy.get('dt').should('contain', 'More details')
          cy.get('dd.cya-answer').should('contain', description)
          cy.get('dd.cya-change > a').should('have.attr', 'href', '/create-payment-link/information?field=payment-link-description')
        })
        cy.get('dl').find('div').eq(2).should('exist').within(() => {
          cy.get('dt').should('contain', 'Reference number')
          cy.get('dd.cya-answer').should('contain', referenceName)
          cy.get('dd.cya-answer').get('span').should('contain', referenceHint)
          cy.get('dd.cya-change > a').should('have.attr', 'href', '/create-payment-link/reference?change=true')
        })
        cy.get('dl').find('div').eq(3).should('exist').within(() => {
          cy.get('dt').should('contain', 'Payment amount')
          cy.get('dd.cya-answer').should('contain', '£10.00')
          cy.get('dd.cya-change > a').should('have.attr', 'href', '/create-payment-link/amount')
        })

        cy.get('button[type=submit]').should('exist').should('contain', 'Create payment link')
      })

      it('should redirect to information page when "Change" clicked', () => {
        cy.get('dl').find('div').eq(0).find('dd.cya-change > a').click()

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/create-payment-link/information`)
        })
      })

      it('should have details pre-filled', () => {
        cy.get('input#payment-link-title').should('have.value', name)
        cy.get('textarea#payment-link-description').should('have.value', description)
      })

      it('should have instructions for an English payment link', () => {
        cy.get('input#payment-link-title').parent('.govuk-form-group').get('span')
          .should('contain', 'For example, “Pay for a parking permit”')
      })
    })
  })

  describe('A Welsh payment link', () => {
    const name = 'Talu am drwydded barcio'
    const description = 'Disgrifiad yn Gymraeg'
    const referenceName = 'rhif anfoneb'
    const referenceHint = 'mewn e-bost'
    const amount = 10

    describe('Information page', () => {
      it('Should display Welsh-specific instructions', () => {
        cy.setEncryptedCookies(userExternalId, gatewayAccountId)

        // TODO start the flow by clicking "Create payment link in Welsh" link when this
        // exists
        cy.visit('/create-payment-link/information?language=cy')

        cy.get('h1').should('contain', 'Set Welsh payment link information')

        cy.get('form[method=post][action="/create-payment-link/information"]').should('exist')
          .within(() => {
            cy.get('input#payment-link-title').should('exist')
            cy.get('input#payment-link-title').should('have.attr', 'lang', 'cy')
            cy.get('label[for="payment-link-title"]').should('contain', 'Welsh title')
            cy.get('input#payment-link-title').parent('.govuk-form-group').get('span')
              .should('contain', 'For example, “Talu am drwydded barcio”')

            cy.get('textarea#payment-link-description').should('exist')
            cy.get('textarea#payment-link-description').should('have.attr', 'lang', 'cy')
            cy.get('label[for="payment-link-description"]').should('exist')
            cy.get('textarea#payment-link-description').parent('.govuk-form-group').get('span')
              .should('contain', 'Give your users more information in Welsh')

            cy.get('button[type=submit]').should('exist')
          })
      })

      it('Should continue to the reference page', () => {
        cy.get('input#payment-link-title').type(name)
        cy.get('textarea#payment-link-description').type(description)

        cy.get('form[method=post][action="/create-payment-link/information"]').within(() => {
          cy.get('button[type=submit]').click()
        })

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/create-payment-link/reference`)
        })
      })
    })

    describe('Reference page', () => {
      it('should have Welsh-specific instructions when "yes" is selected', () => {
        cy.get('h1').should('contain', 'Do your users already have a payment reference?')

        cy.get('form[method=post][action="/create-payment-link/reference"]').should('exist')
          .within(() => {
            cy.get('input[type=radio]#reference-type-custom').should('exist')
            cy.get('input[type=radio]#reference-type-custom').click()

            cy.get('input#reference-label').should('exist')
            cy.get('input#reference-label').should('have.attr', 'lang', 'cy')
            cy.get('input#reference-label').parent('.govuk-form-group').get('span')
              .should('contain', 'For example, “rhif anfoneb”')

            cy.get('textarea#reference-hint-text').should('exist')
            cy.get('textarea#reference-hint-text').should('have.attr', 'lang', 'cy')
            cy.get('textarea#reference-hint-text').parent('.govuk-form-group').get('span')
              .should('contain', 'Explain in Welsh')

            cy.get('button[type=submit]').should('exist')
          })
      })

      it('should continue to the amount page', () => {
        cy.get('form[method=post][action="/create-payment-link/reference"]').should('exist')
          .within(() => {
            cy.get('input#reference-label').type(referenceName)
            cy.get('textarea#reference-hint-text').type(referenceHint)
            cy.get('button[type=submit]').click()
          })

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/create-payment-link/amount`)
        })
      })
    })

    describe('Amount page', () => {
      it('should display content', () => {
        cy.get('form[method=post][action="/create-payment-link/amount"]').should('exist')
          .within(() => {
            cy.get('input[type=radio]#amount-type-fixed').should('exist')
            cy.get('input[type=radio]#amount-type-variable').should('exist')
            cy.get('input#payment-amount').should('exist')
            cy.get('button[type=submit]').should('exist')
          })
      })

      it('should continue to the confirm page', () => {
        cy.get('form[method=post][action="/create-payment-link/amount"]').should('exist')
          .within(() => {
            cy.get('input[type=radio]#amount-type-fixed').click()
            cy.get('input#payment-amount').type(amount)
            cy.get('button[type=submit]').click()
          })

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/create-payment-link/review`)
        })
      })
    })

    describe('Review page', () => {
      it('should have Welsh-specific instructions', () => {
        cy.get('button[type=submit]').should('exist').should('contain', 'Create Welsh payment link')
      })

      it('should redirect to information page when "Change" clicked', () => {
        cy.get('dl').find('div').eq(0).find('dd.cya-change > a').click()

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/create-payment-link/information`)
        })
      })

      it('should have details pre-filled', () => {
        cy.get('input#payment-link-title').should('have.value', name)
        cy.get('textarea#payment-link-description').should('have.value', description)
      })

      it('should have Welsh-specific instructions', () => {
        cy.get('input#payment-link-title').parent('.govuk-form-group').get('span')
          .should('contain', 'For example, “Talu am drwydded barcio”')
      })

      it('should redirect to the review page when "Continue" is clicked', () => {
        cy.get('form[method=post][action="/create-payment-link/information"]').within(() => {
          cy.get('button[type=submit]').click()
        })

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/create-payment-link/review`)
        })
      })

      it('should have Welsh-specific instructions', () => {
        cy.get('button[type=submit]').should('exist').should('contain', 'Create Welsh payment link')
      })
    })
  })
})
