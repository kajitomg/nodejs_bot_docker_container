import { Markup } from 'telegraf';
import { bold, fmt, FmtString, italic, quote } from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { formatText } from '../../../helpers/post-template/format-text';
import sendMessage from '../../../helpers/send-message';
import { Languages } from '../../../models/user/user-model';
import { adminUsers } from '../../../routes/admin-routes';
import Slices from '../../../slices';
import { ScenesTypes } from '../../index';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()
const goToItemHandler = new CallbackQueryWrapper('goto_item')

export const createWizardActivityItem = composeWizardScene(
  async (ctx) => {
    const chat_id = ctx.chat.id
    
    const admin = adminUsers.includes(chat_id)
    let language = ctx.scene.state?.options?.language
    try {
      if(!language) {
        const user = await Slices.user.crud.get({ chat_id })
        language = Languages?.[user.item?.language] || 'ru'
      }
      
      const activity = await Slices.activity.crud.get({
        data: {
          id: ctx.wizard.state.activity_id
        }
      })
      let post = undefined
      if (activity.item.body_id) {
        ctx.wizard.state.body_id = activity.item.body_id
      }
      if (activity.item.post_id) {
        post = (await postController.getPost({
          id: activity.item.post_id
        })).item
      }
      
      ctx.scene.state = {
        ...ctx.scene.state,
        options: {
          ...ctx.scene.state.options,
          language
        }
      }
      ctx.i18n.locale(language)
      const markup = Markup.inlineKeyboard(
        [
          Markup.button.callback('Изменить пост', nextSceneHandler.create(ScenesTypes.post.wizard.BODY_ITEM), !admin || !activity?.item?.body_id),
          Markup.button.callback('Изменить шаблон', nextSceneHandler.create(types.TEMPLATE_CHANGE), !admin),
          Markup.button.callback('Назад', nextSceneHandler.create(ctx.wizard.state.options.entry))
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
            bold(`${activity.item.name} «${ctx.wizard.state.options.game?.name}»`),'\n\n',
            post ? fmt(fmtString,'\n\n') : '',
          ),
          ...(post?.media?.[0] ? {
            media: {
              type: post.media[(post.media?.length - 1) || 0].type,
              file_id: post.media[(post.media?.length - 1) || 0].id
            }} : {}),
          extra: markup
        })
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Активности', e))
    }
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    
    try {
      if (callback_data) {
        await nextSceneHandler.on(callback_data, async (value) => {
          ctx.wizard.state.nextScene = value;
        })
      } else {
        await ctx.sendMessage(`ВЫ покинули меню «Активность ${ctx.wizard.state.options?.game?.name || ''}»`)
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Меню Активности', e))
    }
    
    return done();
  },
);