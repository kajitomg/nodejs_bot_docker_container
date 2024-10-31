import { Markup } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import ActivityController from '../../../controllers/activity-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import sendTest from '../../../helpers/send-message';
import { Game } from '../../../models/game';
import { isAdmin } from '../../../routes/admin-routes';
import { ScenesTypes } from '../../index';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

interface ActivityTemplateChangeProps {
  game: Game
  activity_id: number,
}

export const createWizardActivityTemplateChange = composeWizardScene<ActivityTemplateChangeProps>(
  async (ctx) => {
    const chat_id = ctx.chat.id
    
    const admin = isAdmin(chat_id)
    try {
      const activity = await ActivityController.getActivity({
        id: ctx.scene.session.props.activity_id
      })
      
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Создать шаблон', nextSceneHandler.create(ScenesTypes.post.wizard.TEMPLATE_CREATE), !admin),
          //Markup.button.callback('Выбрать шаблон', nextSceneHandler.create(ScenesTypes.post.wizard.TEMPLATE_LIST), !admin),
          Markup.button.callback('Назад', 'back')
        ],{ columns: 2 }
      )
      
      await sendTest(ctx, {
        text: fmt(bold(`${activity.item.name} «${ctx.scene.session.props.game?.name}»`), '\n\n', bold('Выберите интересующее вас действие:')),
        extra: markup
      }, {clear_media: true})
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Активности', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    
    try {
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          await done(value, {
            activity_id: ctx.scene.session.props.activity_id
          })
        })
        if (callback_data === 'back') {
          await back()
        }
      } else {
        await ctx.sendMessage(`ВЫ покинули меню «Активность ${ctx.scene.session.props.game?.name || ''}»`)
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Активности', e))
    }
    
    return;
  },
);