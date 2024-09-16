import { Composer, Scenes } from 'telegraf';
import start from '../handlers/start';
import { ScenesTypes } from '../scenes';

const userBot = new Composer<Scenes.SceneContext>();

/*userBot.start(start)

userBot.on('message', (ctx) => {
  ctx.sendMessage('Неизвестная команда')
})*/

export default userBot;