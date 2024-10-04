import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import types from './types';

export const createAddCodeContentScene = composeWizardScene(
  async (ctx) => {
    const game = ctx.wizard.state.options.game
    
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
        Markup.button.callback(ctx.i18n.t('code_create.buttons.back'), createNextScene(types.ADD_CODE)),
      ],{ columns: 2 }
    )
    const text = genMessage({
      header: genMessage({
        header: bold(ctx.i18n.t('code_create.name',{ game_name:game.name })),
        body: italic(ctx.i18n.t('code_create.data.enter_value_code',{ value: ctx.i18n.t('code_create.data.content') })),
      }),
      body: fmt(fmt(`- ${ctx.i18n.t('code_create.data.content')}${ctx.wizard.state.code_content ? '' : '*'}: `), bold(ctx.wizard.state.code_content ? ctx.wizard.state.code_content : '-')),
    })
    
    const message = await send(ctx, text, { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup })
    //@ts-ignore
    ctx.wizard.state.delete_message_id = message?.message_id
    
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const { delete_message_id } = ctx.wizard.state;
    const chatId = ctx.chat?.id;
    const callback_query = ctx.update?.callback_query?.data;
    const messageText = ctx.message?.text;
    
    ctx.i18n.locale(ctx.scene.state?.options?.language)
    
    ctx.telegram.editMessageReplyMarkup(chatId, delete_message_id, undefined, undefined)
    
    if (callback_query) {
      const nextScene = getNextScene(callback_query)
      if (nextScene) {
        ctx.wizard.state.nextScene = nextScene;
      }
    } else {
      ctx.wizard.state.nextScene = types.ADD_CODE;
      ctx.wizard.state.code_content = messageText;
    }
    if (ctx.wizard.state.warning) {
      delete ctx.wizard.state.warning;
    }
    
    return done();
  },
);
