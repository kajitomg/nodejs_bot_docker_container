import { Markup } from 'telegraf';
import { BaseScene } from 'telegraf/scenes';
import { MyContext } from '../../../helpers/compose-wizard-scene';

export const ChannelScene = () => {
  const state = {}
  const scene = new BaseScene<MyContext<{},{},{}>>('create_channel')
  
  scene.on('my_chat_member', async (ctx) => {
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('В меню привязки канала', 'connect'),
        Markup.button.callback('Выйти', 'leave'),
      ],{ columns: 2 }
    )
    ctx.scene.session.props = ctx.update.my_chat_member
    ctx.scene.state = ctx.update.my_chat_member
    await ctx.telegram.sendMessage(ctx.update.my_chat_member.from.id,'Вы добавили канал', markup);
    await ctx.scene.leave();
  })
  
  return scene
}