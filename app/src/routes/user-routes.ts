import { Composer, Scenes } from 'telegraf';
import start from '../handlers/start';
import { ScenesTypes } from '../scenes';

const userBot = new Composer<Scenes.SceneContext>();
/*
userBot.start(start)

userBot.command('menu', async ctx => {
  return await ctx.scene.enter(ScenesTypes.menu.wizard.ENTRY)
})

userBot.command('tapswap', async ctx => {
  return await ctx.scene.enter(ScenesTypes.tapSwap.wizard.ENTRY)
})

userBot.command('xempire', async ctx => {
  return await ctx.scene.enter(ScenesTypes.xEmpire.wizard.ENTRY)
})

userBot.command('blum', async ctx => {
  return await ctx.scene.enter(ScenesTypes.blum.wizard.ENTRY)
})

userBot.on('message', (ctx) => {
  ctx.sendMessage('Неизвестная команда')
})
*/
export default userBot;