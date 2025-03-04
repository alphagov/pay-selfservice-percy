'use strict'

const GatewayAccountUpdateRequest = require('@models/gateway-account/GatewayAccountUpdateRequest.class')
const logger = require('../utils/logger')(__filename)
const ConnectorClient = require('./clients/connector.client.js').ConnectorClient

const connectorClient = new ConnectorClient(process.env.CONNECTOR_URL)

async function updateConfirmationTemplate (accountID, emailText) {
  try {
    const patch = { op: 'replace', path: '/payment_confirmed/template_body', value: emailText }

    await connectorClient.updateConfirmationEmail({
      payload: patch,
      gatewayAccountId: accountID
    })
  } catch (err) {
    clientFailure(err, 'PATCH', true)
  }
}

/**
 * @param {string} serviceExternalId
 * @param {string} accountType
 * @param {string} customParagraph
 */
async function updateCustomParagraphByServiceIdAndAccountType (serviceExternalId, accountType, customParagraph) {
  try {
    const payload = { op: 'replace', path: '/payment_confirmed/template_body', value: customParagraph }
    await connectorClient.patchEmailNotificationByServiceIdAndAccountType(serviceExternalId, accountType, payload)
  } catch (err) {
    clientFailure(err, 'PATCH', false)
  }
}

async function setEmailCollectionMode (accountID, collectionMode) {
  try {
    const patch = { op: 'replace', path: 'email_collection_mode', value: collectionMode }
    await connectorClient.updateEmailCollectionMode({
      payload: patch,
      gatewayAccountId: accountID
    })
  } catch (err) {
    clientFailure(err, 'PATCH', false)
  }
}

async function setEmailCollectionModeByServiceIdAndAccountType (serviceExternalId, accountType, collectionMode) {
  try {
    const updateEmailCollectionModeRequest = new GatewayAccountUpdateRequest()
      .replace().emailCollectionMode(collectionMode)
    await connectorClient.patchGatewayAccountByServiceExternalIdAndAccountType(serviceExternalId, accountType, updateEmailCollectionModeRequest)
  } catch (err) {
    clientFailure(err, 'PATCH', false)
  }
}

async function setConfirmationEnabled (accountID, enabled) {
  const patch = { op: 'replace', path: '/payment_confirmed/enabled', value: enabled }

  try {
    await connectorClient.updateConfirmationEmailEnabled({
      payload: patch,
      gatewayAccountId: accountID
    })
  } catch (err) {
    clientFailure(err, 'PATCH', true)
  }
}

/**
 * @param {string} serviceExternalId
 * @param {string} accountType
 * @param {boolean} enabled
 */
async function setConfirmationEnabledByServiceIdAndAccountType (serviceExternalId, accountType, enabled) {
  try {
    const payload = { op: 'replace', path: '/payment_confirmed/enabled', value: enabled }
    await connectorClient.patchEmailNotificationByServiceIdAndAccountType(serviceExternalId, accountType, payload)
  } catch (err) {
    clientFailure(err, 'PATCH', false)
  }
}

/**
 * @param {string} serviceExternalId
 * @param {string} accountType
 * @param {boolean} enabled
 */
async function setRefundEmailEnabledByServiceIdAndAccountType (serviceExternalId, accountType, enabled) {
  try {
    const payload = { op: 'replace', path: '/refund_issued/enabled', value: enabled }
    await connectorClient.patchEmailNotificationByServiceIdAndAccountType(serviceExternalId, accountType, payload)
  } catch (err) {
    clientFailure(err, 'PATCH', false)
  }
}

async function setRefundEmailEnabled (accountID, enabled) {
  try {
    const patch = { op: 'replace', path: '/refund_issued/enabled', value: enabled }
    await connectorClient.updateRefundEmailEnabled({
      payload: patch,
      gatewayAccountId: accountID
    })
  } catch (err) {
    clientFailure(err, 'PATCH', true)
  }
}

function clientFailure (err, methodType, isPatchEndpoint) {
  const errMsg = isPatchEndpoint
    ? 'Calling connector to update email notifications for an account threw exception'
    : 'Calling connector to get/patch account data threw exception'
  logger.error(errMsg, {
    service: 'connector',
    method: methodType,
    error: err
  })
  throw new Error(errMsg)
}

module.exports = {
  updateConfirmationTemplate,
  updateCustomParagraphByServiceIdAndAccountType,
  setEmailCollectionMode,
  setEmailCollectionModeByServiceIdAndAccountType,
  setConfirmationEnabled,
  setConfirmationEnabledByServiceIdAndAccountType,
  setRefundEmailEnabled,
  setRefundEmailEnabledByServiceIdAndAccountType
}
