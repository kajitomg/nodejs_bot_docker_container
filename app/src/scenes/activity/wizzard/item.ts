import { Markup } from 'telegraf';
import { bold, fmt, FmtString} from 'telegraf/format';
import ActivityController from '../../../controllers/activity-controller';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { formatText } from '../../../helpers/post-template/format-text';
import sendMessage from '../../../helpers/send-message';
import { Game } from '../../../models/game';
import { isAdmin } from '../../../routes/admin-routes';
import { ScenesTypes } from '../../index';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

interface ActivityItemProps {
  game: Game
  activity_id: number,
  body_id: number
}

export const createWizardActivityItem = composeWizardScene<ActivityItemProps>(
  async (ctx) => {
    const chat_id = ctx.chat.id
    
    const admin = isAdmin(chat_id)
    try {
     
      const activity = await ActivityController.getActivity({
        id: ctx.scene.session.props.activity_id
      })
      let post = undefined
      if (activity.item.body_id) {
        ctx.scene.session.props.body_id = activity.item.body_id
      }
      if (activity.item.post_id) {
        post = (await postController.getPost({
          id: activity.item.post_id
        })).item
      }
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Изменить пост', nextSceneHandler.create(ScenesTypes.post.wizard.BODY_ITEM), !admin || !activity?.item?.body_id),
          Markup.button.callback('Изменить шаблон', nextSceneHandler.create(types.TEMPLATE_CHANGE), !admin),
          Markup.button.callback('Назад', 'back')
        ],{ columns: 2 }
      )
      const formatted = formatText(
        post?.template,
        post?.variables,
        post?.entities
      )
      
      const fmtString = new FmtString(formatted.text, formatted.entities)
       await sendMessage(
        ctx,{
          text: fmt(
            bold(`${activity.item.name} «${ctx.scene.session.props.game?.name}»`),'\n\n',
            post ? fmt(fmtString,'\n\n') : '',
          ),
          ...(post?.media?.[0] ? {
            media: {
              type: post.media[(post.media?.length - 1) || 0].type,
              file_id: post.media[(post.media?.length - 1) || 0].id
            }} : {}),
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
          switch (value) {
            case ScenesTypes.post.wizard.BODY_ITEM: {
              await done(value, {
                post_id: ctx.scene.session.props.body_id,
                activity_id: ctx.scene.session.props.activity_id,
              })
              return
            }
            case types.TEMPLATE_CHANGE: {
              await done(value, {
                game: ctx.scene.session.props.game,
                activity_id: ctx.scene.session.props.activity_id,
              })
              return
            }
          }
        })
        if( callback_data === 'back' ) {
          await back()
        }
      } else {
        await ctx.sendMessage(`Вы покинули меню «Активность ${ctx.scene.session.props?.game?.name || ''}»`)
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Активности', e))
    }
    
    return;
  },
);