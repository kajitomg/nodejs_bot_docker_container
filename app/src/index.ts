import path from 'path';
import { Scenes, session, Telegraf } from 'telegraf';
import { MyContext } from './helpers/compose-wizard-scene';
import adminRoutes from './routes/admin-routes';
import userRoutes from './routes/user-routes';
import { WizardScenes } from './scenes';
import { ChannelScene } from './scenes/channel/base/create';
import services from './services';
import * as models from './models';
import  TelegrafI18n from 'telegraf-i18n';
import { Redis } from "@telegraf/session/redis";

const store = Redis({
  url: "redis://redis:6379"
});

const i18n = new TelegrafI18n({
  defaultLanguage: 'ru',
  directory: path.resolve('src/locales'),
});


const bot = new Telegraf<MyContext>(process.env.API_KEY_BOT );



const stage = new Scenes.Stage<MyContext>([
  ...WizardScenes,
  ChannelScene()
])

bot.use(i18n.middleware());
bot.use(session({ store }))
bot.use(stage.middleware())

bot.use(adminRoutes)

bot.use(userRoutes)

bot.catch((err, ctx) => {
  console.log(err)
})

const db = services.db

const server = services.server

server.run(async () => {
  await db.postgres.start(models)
  await bot.launch()
})

