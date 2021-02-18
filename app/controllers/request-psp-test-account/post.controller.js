'use strict'

const { response } = require('../../utils/response')
const zendeskClient = require('../../services/clients/zendesk.client')
const getAdminUsersClient = require('../../services/clients/adminusers.client')
const logger = require('../../utils/logger')(__filename)
const { CREATED, NOT_STARTED, REQUEST_SUBMITTED } = require('../../models/psp-test-account-stage')
const adminUsersClient = getAdminUsersClient()
const { keys } = require('@govuk-pay/pay-js-commons').logging

async function submitRequestAndUpdatePspTestAccountStatus (req) {
  const message = `Service name: ${req.service.name}
    Service ID: ${req.service.externalId}
    PSP: 'Stripe'
    Email address: ${req.user.email}
    Time: ${new Date().toISOString()}
    Service created at: ${req.service.createdDate}`

  const zendeskOpts = {
    correlationId: req.correlationId,
    email: req.user.email,
    name: req.user.username,
    type: 'task',
    subject: `Request for test Stripe account from service (${req.service.name})`,
    tags: ['govuk_pay_support'],
    message: message
  }

  await zendeskClient.createTicket(zendeskOpts)
  await adminUsersClient.updatePspTestAccountStage(req.service.externalId, REQUEST_SUBMITTED, req.correlationId)

  const logContext = {
    is_internal_user: req.user && req.user.internalUser
  }
  logContext[keys.USER_EXTERNAL_ID] = req.user.externalId
  logContext[keys.SERVICE_EXTERNAL_ID] = req.service.externalId

  logger.info('Submitted request for test Stripe account', logContext)
}

module.exports = async function submitRequestForPspTestAccount (req, res, next) {
  const service = req.service
  try {
    const pageData = {}

    if (service.currentPspTestAccountStage === NOT_STARTED || !service.currentPspTestAccountStage) {
      await submitRequestAndUpdatePspTestAccountStatus(req)
      pageData.pspTestAccountRequestSubmitted = true
    } else {
      pageData.requestForPspTestAccountSubmitted = (service.currentPspTestAccountStage === REQUEST_SUBMITTED)
      pageData.pspTestAccountCreated = (service.currentPspTestAccountStage === CREATED)
      logger.info('Request for stripe test account cannot be submitted',
        { current_psp_test_account_stage: service.currentPspTestAccountStage })
    }

    return response(req, res, 'request-psp-test-account/index', pageData)
  } catch (error) {
    return next(error)
  }
}
