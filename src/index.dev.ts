import PDP from './pdp'
import Pino from 'pino'

async function main() {
  const logger = Pino<string>({ level: 'debug' })
  logger.debug(undefined, 'Starting development script.')
  const pdp = await PDP.create({
    applicationId: '65f0674f39d8a1a5ef805ca7',
    hostname: 'localhost:5010',
    ssl: false,
    logger,
  })

  process.on('SIGINT', () => {
    logger.debug(undefined, 'Recieved SIGINT, ending development script.')
    pdp.shutdown()
    process.exit(0)
  })
}

main().catch((error) => {
  Pino().error(error)
})
