import { Composer, Scenes } from 'telegraf';
import { HandlerError } from '../exceptions/api-error';
import start from '../handlers/start';
import { ScenesTypes } from '../scenes';

const userBot = new Composer<Scenes.SceneContext>();

userBot.start(start)

userBot.command('language', async ctx => {
  return await ctx.scene.enter(ScenesTypes.language.wizard.CHANGE_LANGUAGE)
})

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
  try {
    ctx.sendMessage('Неизвестная команда')
  } catch (error) {
    console.error(new HandlerError(400, `Ошибка: Сцена сообщения`, error))
  }
})

export default userBot;