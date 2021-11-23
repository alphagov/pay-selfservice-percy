'use strict'

const webhooksFixtures = require('../../fixtures/webhooks.fixtures')
const { stubBuilder } = require('./stub-builder')

function getWebhooksListSuccess(opts) {
  const path = '/v1/webhook'
  return stubBuilder('GET', path, 200, {
    query: {
      service_id: opts.service_id,
      live: opts.live
    },
    response: webhooksFixtures.webhooksListResponse(opts.webhooks || [])
  })
}

function getWebhookSuccess(opts = {}) {
  const webhook = webhooksFixtures.webhookResponse(opts)
  const path = `/v1/webhook/${webhook.external_id}`
  return stubBuilder('GET', path, 200, {
    query: {
      service_id: webhook.service_id
    },
    response: webhook
  })
}

module.exports = {
  getWebhooksListSuccess,
  getWebhookSuccess
}
