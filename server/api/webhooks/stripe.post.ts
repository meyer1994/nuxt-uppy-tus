import { assertValidStripeEvent } from '~/server/utils/asserts'

export default defineEventHandler(async (event) => {
  console.info('Validating stripe event')
  const body = await assertValidStripeEvent(event)
  console.info('Validated stripe event')
  console.debug(body)

  if (body.type !== 'checkout.session.completed') {
    console.info(`Unhandled event type: ${body.type}`)
    return 'OK'
  }

  if (!body.data.object.client_reference_id) {
    console.info('No client reference id')
    return 'OK'
  }

  return 'OK'
})
