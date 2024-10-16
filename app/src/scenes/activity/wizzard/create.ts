import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { adminUsers } from '../../../routes/admin-routes';
import Slices from '../../../slices';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createCreateActivityScene = composeWizardScene(
  async (ctx) => {
    const chat_id = ctx.chat.id
    
    if (!ctx.wizard.state.activity) ctx.wizard.state.activity = {}
    
    const admin = adminUsers.includes(chat_id)
    try {
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Изменить название', nextSceneHandler.create(types.CHANGE_NAME), !admin),
          Markup.button.callback('Создать активность', 'create', !admin),
          Markup.button.callback('Назад', nextSceneHandler.create(ctx.wizard.state.options.entry), !admin)
        ],{ columns: 2 }
      )
      await send(ctx, fmt(
        bold(`Создание активности «${ctx.wizard.state.options.game?.name}»`), '\n\n',
        bold(`Название${!ctx.wizard.state.activity?.name ? '*' : ''}: ${ctx.wizard.state.activity?.name || '-'}`),'\n\n',
      ), markup);
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Активности', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    
    try {
      if (callback_data) {
        nextSceneHandler.on(callback_data, async (value) => {
          ctx.wizard.state.nextScene = value;
        })
        if(callback_data === 'create') {
          if(!ctx.wizard.state.activity?.name) {
            ctx.wizard.state.nextScene = types.CREATE;
          } else {
            await Slices.activity.crud.create({
              data: {
                name: ctx.wizard.state.activity?.name,
                game: ctx.scene.state.options.game.id
              }
            })
            ctx.wizard.state.nextScene = ctx.wizard.state.options.entry;
          }
          delete ctx.wizard.state.activity
        }
      } else {
        await ctx.sendMessage(`ВЫ покинули меню Создания активности`)
        delete ctx.wizard.state.activity
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Активности', e))
    }
    
    return done();
  },
);