require('dotenv').config()
import { Telegraf, Scenes, session } from 'telegraf';
import adminRoutes from './routes/admin-routes';
import userRoutes from './routes/user-routes';

const bot = new Telegraf<Scenes.SceneContext>(process.env.API_KEY_BOT );

bot.use(session())

bot.use(adminRoutes)

bot.use(userRoutes)

export default bot