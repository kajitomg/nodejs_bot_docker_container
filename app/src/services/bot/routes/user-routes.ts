import { Composer, Scenes } from 'telegraf';

const userBot = new Composer<Scenes.SceneContext>();

userBot.on('message', (ctx) => {
  ctx.sendMessage('Reply')
})

export default userBot;