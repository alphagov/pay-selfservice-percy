const { findByExternalId } = require('@services/user.service')
const { response } = require('@utils/response')
const formatSimplifiedAccountPathsFor = require('../../../../../utils/simplified-account/format/format-simplified-account-paths-for')
const paths = require('@root/paths')

async function get (req, res, next) {
  const externalServiceId = req.service.externalId
  const accountType = req.account.type
  const serviceHasAgentInitiatedMotoEnabled = req.service.agentInitiatedMotoEnabled
  try {
    const { email } = await findByExternalId(req.params.externalUserId)
    response(req, res, 'simplified-account/settings/team-members/change-permission',
      {
        email,
        serviceHasAgentInitiatedMotoEnabled,
        backLink: formatSimplifiedAccountPathsFor(paths.simplifiedAccount.settings.teamMembers.index, externalServiceId, accountType)
      })
  } catch (err) {
    next(err)
  }
}

async function post (req, res, next) {
  // TODO implement change permissions
  console.log('post to change permission controller')
  const externalServiceId = req.service.externalId
  const accountType = req.account.type
  res.redirect(formatSimplifiedAccountPathsFor(paths.simplifiedAccount.settings.teamMembers.index, externalServiceId, accountType))
}

module.exports = {
  get,
  post
}
