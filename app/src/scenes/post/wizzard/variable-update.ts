import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import sendMessage from '../../../helpers/send-message';
import { Post } from '../../../models/post/post-model';
import types from './types';

interface PostVariableUpdateProps {
  post_id: number,
  variable_name: string,
  post?: Post
}

export const createCreateVariablePostTemplateScene = composeWizardScene<PostVariableUpdateProps>(
  async (ctx) => {
    const post = (await postController.getPost({
      id: ctx.scene.session.props.post_id
    })).item
    ctx.scene.session.props.post = post
    
    const variable = post.variables.find((item) => item.name === ctx.scene.session.props.variable_name)
   
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback('Назад', 'back'),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: genMessage({
        header: bold('Шаблон поста'),
        body: fmt(fmt(`Переменная: `), bold(variable.name),'\n', fmt(`Значение: `), bold(variable.value ? variable.value : '-')),
      }),
      body: italic('Отправьте значение переменной:'),
    })
    
    await sendMessage(ctx, {
      text,
      extra: markup,
    })
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const callback_data = ctx.callbackQuery?.['data'];
    const messageText = ctx.message?.['text'];
    const post = ctx.scene.session.props.post
    
    await sendMessage(ctx, {}, {clear_markup: true})
    
    if (callback_data) {
      if (callback_data === 'back' ) {
        await back();
      }
    } else {
      const index = post.variables.findIndex((item) => item.name === ctx.scene.session.props.variable_name)
      const variables = [
        ...post.variables
      ]
      variables[index].value = messageText
      await postController.updatePost({
        id: ctx.scene.session.props.post_id,
        variables
      })
      await back(types.VARIABLES_LIST);
    }
    
    return;
  },
);
