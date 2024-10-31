import { Composer, Context, Markup, Scenes } from 'telegraf';
import { MyContext } from '../helpers/compose-wizard-scene';
import { ScenesTypes } from '../scenes';
import { ChannelScene } from '../scenes/channel/base/create';

export const adminUsers = [
  806145885,
  1259372103
]
export const isAdmin = (chat_id: number) => adminUsers.includes(chat_id)


const adminBot = new Composer<MyContext>();
/*
adminBot.command('test', async (ctx) => {
  return ctx.scene.enter('create_channel')
})

adminBot.on('my_chat_member', async (ctx) => {
  const markup = Markup.inlineKeyboard(
    [
      Markup.button.callback('В меню привязки канала', 'connect'),
    ],{ columns: 2 }
  )
  await ctx.telegram.sendMessage(ctx.update.my_chat_member.from.id,'Вы добавили канал', markup);
})

adminBot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery['data'];
  
  switch (data) {
    case 'connect':
      break;
  }
  
  await ctx.answerCbQuery();
});
*/
adminBot.command('broadcast', async ctx => {
  return await ctx.scene.enter(ScenesTypes.broadcast.wizard.ENTRY)
})

adminBot.command('mandatory', async ctx => {
  return await ctx.scene.enter(ScenesTypes.mandatorySubscription.wizard.ENTRY)
})

export default Composer.acl(adminUsers,adminBot);