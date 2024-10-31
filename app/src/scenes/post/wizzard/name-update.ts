import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import sendMessage from '../../../helpers/send-message';
import { Post } from '../../../models/post/post-model';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

interface NameUpdateProps {
  post_id: number,
  post?: Partial<Omit<Post, 'id' | 'type' | 'media'>>,
  warning?: string
}

export const createPostNameUpdateScene = composeWizardScene<NameUpdateProps>(
  async (ctx) => {
    const post = (await postController.getPost({
      id: ctx.scene.session.props.post_id
    })).item
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Назад', 'back'),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: genMessage({
        header: bold('Название поста'),
        body: fmt(fmt(`- Название: `), bold(post.name ? post.name : '-')),
      }),
      body: italic('Отправьте название шаблона:'),
    })
    await sendMessage(ctx, {
      text,
      extra: { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup }
    },{clear_media: true})
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const message_text = ctx.message?.['text'];
    
    await sendMessage(ctx, {}, {clear_markup: true})
    
    if (callback_data) {
      if (callback_data === 'back') {
        await back();
      }
    } else {
      await postController.updatePost({
        id: ctx.scene.session.props.post_id,
        name: message_text
      })
      await back();
    }
    
    return;
  },
);
