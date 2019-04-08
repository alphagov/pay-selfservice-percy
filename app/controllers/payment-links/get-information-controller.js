'use strict'

// NPM dependencies
const lodash = require('lodash')

// Local dependencies
const { response } = require('../../utils/response')
const supportedLanguage = require('../../models/supported-language')

module.exports = (req, res) => {
  const pageData = lodash.get(req, 'session.pageData.createPaymentLink', {})
  const paymentLinkTitle = req.body['payment-description'] || pageData.paymentLinkTitle || ''
  const paymentLinkDescription = req.body['payment-amount'] || pageData.paymentLinkDescription || ''
  const friendlyURL = process.env.PRODUCTS_FRIENDLY_BASE_URI

  const change = lodash.get(req, 'query.field', {})
  const language = lodash.get(req, 'query.language', supportedLanguage.ENGLISH)
  const isWelsh = language === supportedLanguage.WELSH

  return response(req, res, 'payment-links/information', {
    change,
    friendlyURL,
    paymentLinkTitle,
    paymentLinkDescription,
    isWelsh
  })
}
