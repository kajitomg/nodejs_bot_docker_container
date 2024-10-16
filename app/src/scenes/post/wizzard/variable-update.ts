import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import postController from '../../../controllers/post-controller';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import send from '../../../helpers/send';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

export const createCreateVariablePostTemplateScene = composeWizardScene(
  async (ctx) => {
    const post = (await postController.getPost({
      id: ctx.wizard.state.body_id
    })).item
    const variable = post.variables.find((item) => item.name === ctx.wizard.state.variable)
    
    const chat_id = ctx.chat.id
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
        Markup.button.callback('Назад', nextSceneHandler.create(types.VARIABLES_LIST)),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: genMessage({
        header: bold('Шаблон поста'),
        body: fmt(fmt(`Переменная: `), bold(variable.name),'\n', fmt(`Значение: `), bold(variable.value ? variable.value : '-')),
      }),
      body: italic('Отправьте значение переменной:'),
    })
    
    const message = await send(ctx, text, { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup })
    //@ts-ignore
    ctx.wizard.state.delete_message_id = message?.message_id
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const chatId = ctx.chat?.id;
    const callback_data = ctx.update?.callback_query?.data;
    const messageText = ctx.message?.text;
    
    ctx.i18n.locale(ctx.scene.state?.options?.language)
    
    ctx.telegram.editMessageReplyMarkup(chatId, ctx.wizard.state.delete_message_id, undefined, undefined)
    
    if (callback_data) {
      nextSceneHandler.on(callback_data, async (value) => {
        ctx.wizard.state.nextScene = value;
      })
    } else {
      const post = (await postController.getPost({
        id: ctx.wizard.state.body_id
      })).item
      const index = post.variables.findIndex((item) => item.name === ctx.wizard.state.variable)
      console.log(index,ctx.wizard.state.post)
      const variables = [
        ...post.variables
      ]
      variables[index].value = messageText
      console.log(variables)
      await postController.updatePost({
        id: ctx.wizard.state.body_id,
        variables
      })
      ctx.wizard.state.nextScene = types.VARIABLES_LIST;
    }
    
    if (ctx.wizard.state.warning) {
      delete ctx.wizard.state.warning;
    }
    
    return done();
  },
);
