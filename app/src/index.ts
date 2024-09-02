import services from './services';
import models from './models';

const bot = services.bot

const db = services.db

const server = services.server

server.run(async () => {
  await db.postgres.start(models)
  await bot.launch()
})

