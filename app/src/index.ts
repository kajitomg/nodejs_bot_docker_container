import { Scenes, session, Telegraf } from 'telegraf';
import adminRoutes from './routes/admin-routes';
import userRoutes from './routes/user-routes';
import { WizardScenes } from './scenes';
import services from './services';
import models from './models';

const bot = new Telegraf<Scenes.SceneContext>(process.env.API_KEY_BOT );

const stage = new Scenes.Stage<Scenes.SceneContext>([
  ...WizardScenes,
])

bot.use(session())
bot.use(stage.middleware())

bot.use(adminRoutes)

bot.use(userRoutes)

const db = services.db

const server = services.server

server.run(async () => {
  await db.postgres.start(models)
  await bot.launch()
})

