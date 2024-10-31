import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import ActivityController from '../../../controllers/activity-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import send from '../../../helpers/send';
import { Activity } from '../../../models/activity/activity-model';
import { Game } from '../../../models/game';
import { isAdmin } from '../../../routes/admin-routes';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

interface CreateProps {
  game: Game
  activity: Partial<Omit<Activity, 'id'>>,
}

export const createCreateActivityScene = composeWizardScene<CreateProps>(
  async (ctx) => {
    const chat_id = ctx.chat.id
    
    if (!ctx.scene.session.props.activity) ctx.scene.session.props.activity = {}
    
    const admin = isAdmin(chat_id)
    try {
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Изменить название', nextSceneHandler.create(types.CHANGE_NAME), !admin),
          Markup.button.callback('Создать активность', 'create', !admin),
          Markup.button.callback('Назад', 'back', !admin)
        ],{ columns: 2 }
      )
      await send(ctx, fmt(
        bold(`Создание активности «${ctx.scene.session.props.game?.name}»`), '\n\n',
        bold(`Название${!ctx.scene.session.props.activity?.name ? '*' : ''}: ${ctx.scene.session.props.activity?.name || '-'}`),'\n\n',
      ), markup);
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Активности', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        if (callback_data === 'back') {
          await back();
        }
        await nextSceneHandler.on(callback_data, async (value) => {
          await done(value, {
            ...ctx.scene.session.props
          });
        })
        if(callback_data === 'create') {
          if(!ctx.scene.session.props.activity?.name) {
            await done(types.CREATE, {
              ...ctx.scene.session.props
            })
          } else {
            await ActivityController.createActivity({
              name: ctx.scene.session.props.activity?.name,
              game: ctx.scene.session.props.game.id
            })
            await done(types.CREATE, {
              game: ctx.scene.session.props.game
            });
          }
        }
      } else {
        await ctx.sendMessage(`ВЫ покинули меню Создания активности`)
        await done()
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Активности', e))
    }
    
    return;
  },
);