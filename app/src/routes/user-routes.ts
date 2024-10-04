import { Composer, Scenes } from 'telegraf';
import { HandlerError } from '../exceptions/api-error';
import start from '../handlers/start';
import { Languages } from '../models/user/user-model';
import { ScenesTypes } from '../scenes';
import Slices from '../slices';

const userBot = new Composer<Scenes.SceneContext>();

userBot.start(start)

userBot.command('menu', async ctx => {
  return await ctx.scene.enter(ScenesTypes.menu.wizard.ENTRY)
})

userBot.command('profile', async ctx => {
  return await ctx.scene.enter(ScenesTypes.menu.wizard.PROFILE)
})

userBot.command('games', async ctx => {
  return await ctx.scene.enter(ScenesTypes.menu.wizard.GAMES)
})

userBot.command('tapswap', async ctx => {
  // @ts-ignore
  ctx.scene.state.mandatory_channel_next = ScenesTypes.tapSwap.wizard.ENTRY
  return await ctx.scene.enter(ScenesTypes.mandatorySubscription.wizard.MANDATORY, ctx.scene.state)
})

userBot.command('xempire', async ctx => {
  // @ts-ignore
  ctx.scene.state.mandatory_channel_next = ScenesTypes.xEmpire.wizard.ENTRY
  return await ctx.scene.enter(ScenesTypes.mandatorySubscription.wizard.MANDATORY, ctx.scene.state)
})

userBot.command('blum', async ctx => {
  // @ts-ignore
  ctx.scene.state.mandatory_channel_next = ScenesTypes.blum.wizard.ENTRY
  return await ctx.scene.enter(ScenesTypes.mandatorySubscription.wizard.MANDATORY, ctx.scene.state)
})

userBot.on('message', async (ctx) => {
  const chat_id = ctx.chat.id
  try {
    const user = (await Slices.user.crud.get({ chat_id }))
    const language = Languages?.[user.item?.language] || 'ru'
    //@ts-ignore
    ctx.i18n.locale(language)
    //@ts-ignore
    ctx.sendMessage(ctx.i18n.t('unknown_command'))
  } catch (error) {
    console.error(new HandlerError(400, `Ошибка: Сцена сообщения`, error))
  }
})

export default userBot;