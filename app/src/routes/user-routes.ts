import { Composer, Scenes } from 'telegraf';
import { HandlerError } from '../exceptions/api-error';
import start from '../handlers/start';
import { MyContext } from '../helpers/compose-wizard-scene';
import { GamesData } from '../models/game';
import { Languages } from '../models/user/user-model';
import { ScenesTypes } from '../scenes';
import Slices from '../slices';

const userBot = new Composer<MyContext>();

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
  ctx.scene.session.props = {
    next_scene: ScenesTypes.tapSwap.wizard.ENTRY
  }
  return await ctx.scene.enter(ScenesTypes.mandatorySubscription.wizard.MANDATORY, ctx.scene.state)
})

userBot.command('blum', async ctx => {
  ctx.scene.session.props = {
    next_scene: ScenesTypes.blum.wizard.ENTRY
  }
  return await ctx.scene.enter(ScenesTypes.mandatorySubscription.wizard.MANDATORY, ctx.scene.state)
})

userBot.command('cats', async ctx => {
  ctx.scene.session.props = {
    next_scene: ScenesTypes.cats.wizard.ENTRY,
  }
  return await ctx.scene.enter(ScenesTypes.mandatorySubscription.wizard.MANDATORY, ctx.scene.state)
})
/*
userBot.command('paws', async ctx => {
  ctx.scene.session.props = {
    next_scene: ScenesTypes.paws.wizard.ENTRY,
  }
  return await ctx.scene.enter(ScenesTypes.mandatorySubscription.wizard.MANDATORY, ctx.scene.state)
})*/

userBot.command('bums', async ctx => {
  ctx.scene.session.props = {
    next_scene: ScenesTypes.bums.wizard.ENTRY,
  }
  return await ctx.scene.enter(ScenesTypes.mandatorySubscription.wizard.MANDATORY, ctx.scene.state)
})

userBot.command('cityholder', async ctx => {
  ctx.scene.session.props = {
    next_scene: ScenesTypes.cityholder.wizard.ENTRY,
  }
  return await ctx.scene.enter(ScenesTypes.mandatorySubscription.wizard.MANDATORY, ctx.scene.state)
})

userBot.command('hot', async ctx => {
  ctx.scene.session.props = {
    next_scene: ScenesTypes.hot.wizard.ENTRY,
  }
  return await ctx.scene.enter(ScenesTypes.mandatorySubscription.wizard.MANDATORY, ctx.scene.state)
})

userBot.command('hamsterkombat', async ctx => {
  ctx.scene.session.props = {
    next_scene: ScenesTypes.hamsterkombat.wizard.ENTRY,
  }
  return await ctx.scene.enter(ScenesTypes.mandatorySubscription.wizard.MANDATORY, ctx.scene.state)
})

userBot.on('message', async (ctx) => {
  const chat_id = ctx.chat.id
  try {
    const user = (await Slices.user.crud.get({ chat_id }))
    const language = Languages?.[user.item?.language] || 'ru'
    console.log(ctx.message)
    //@ts-ignore
    ctx.i18n.locale(language)
    //AgACAgIAAxkBAAIRCmcC9AABb-7SuSQDSeh59UFIhruM1gAC9eYxG-_4GUi4EeVeXsL3QgEAAwIAA3kAAzYE p1
    //BAACAgIAAxkBAAIRDGcC9GgvFaJFY9kj7XO5SEeM0cVjAAJAYgAC7_gZSHkMuIma6m_ENgQ v1
    //BAACAgIAAxkBAAIRGmcC93SSwVUAAcf4SZfUMMP0ERveMgACbWIAAu_4GUiUTOKkXZtIbjYE v2
    
    //@ts-ignore
    ctx.sendMessage(ctx.i18n.t('unknown_command'))
  } catch (error) {
    console.error(new HandlerError(400, `Ошибка: Сцена сообщения`, error))
  }
})

export default userBot;