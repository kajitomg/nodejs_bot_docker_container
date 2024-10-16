import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import sendTest from '../../../helpers/send-message';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import { ScenesTypes } from '../../index';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createPostNameUpdateScene = composeWizardScene(
  async (ctx) => {
    const chat_id = ctx.chat.id
    const post = (await postController.getPost({
      id: ctx.wizard.state.body_id
    })).item
    let language = ctx.scene.state?.options?.language
    
    if(!language) {
      const user = await Slices.user.crud.get({ chat_id })
      language = Languages?.[user.item?.language] || 'ru'
    }
    
    if (ctx.wizard.state.options) {
      ctx.wizard.state.options.language = language
    } else {
      ctx.wizard.state.options = {
        language
      }
    }
    ctx.i18n.locale(language)
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Назад', nextSceneHandler.create(types.BODY_ITEM)),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: genMessage({
        header: bold('Шаблон поста'),
        body: fmt(fmt(`- Название: `), bold(post.name ? post.name : '-')),
      }),
      body: italic('Отправьте название шаблона:'),
    })
    await sendTest(ctx, {
      text,
      extra: { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup }
    },{clear_media: true})
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const callback_data = ctx.update?.callback_query?.data;
    const messageText = ctx.message?.text;
    await sendTest(ctx, {}, {clear_markup: true})
    ctx.i18n.locale(ctx.scene.state?.options?.language)
    
    if (callback_data) {
      nextSceneHandler.on(callback_data, async (value) => {
        ctx.wizard.state.nextScene = value;
      })
    } else {
      await postController.updatePost({
        id: ctx.wizard.state.body_id,
        name: messageText
      })
      ctx.wizard.state.nextScene = types.BODY_ITEM;
    }
    
    if (ctx.wizard.state.warning) {
      delete ctx.wizard.state.warning;
    }
    
    return done();
  },
);
