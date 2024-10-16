import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import send from '../../../helpers/send';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

const ToMandatoryHandler = new CallbackQueryWrapper('to_mandatory'
)
export const createAddCodeScene = composeWizardScene(
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
        Markup.button.callback(ctx.i18n.t('code_create.buttons.change', {value: ctx.i18n.t('code_create.data.name')}), nextSceneHandler.create(types.ADD_CODE_NAME)),
        Markup.button.callback(ctx.i18n.t('code_create.buttons.change', {value: ctx.i18n.t('code_create.data.content')}), nextSceneHandler.create(types.ADD_CODE_CONTENT)),
        Markup.button.callback(ctx.i18n.t('code_create.buttons.back'), nextSceneHandler.create(ctx.wizard.state.options.entry)),
        Markup.button.callback(ctx.i18n.t('code_create.buttons.create'), nextSceneHandler.create(types.ADD_CODE_ADD_TO_DB)),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: bold(ctx.i18n.t('code_create.name',{ game_name:game.name })),
      body: fmt(fmt(`- ${ctx.i18n.t('code_create.data.name')}${ctx.wizard.state.code_name ? '' : '*'}: `), bold(ctx.wizard.state.code_name ? ctx.wizard.state.code_name : '-'),fmt('\n'),fmt(`- ${ctx.i18n.t('code_create.data.content')}${ctx.wizard.state.code_content ? '' : '*'}: `), bold(ctx.wizard.state.code_content ? ctx.wizard.state.code_content : '-')),
      ...(ctx.wizard.state.warning && {footer: italic(`${ctx.wizard.state.warning}*`)})
    })
    
    await send(ctx, text, { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup })
    
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const game = ctx.wizard.state.options.game
    const callback_data = ctx.update?.callback_query?.data;
    
    ctx.i18n.locale(ctx.scene.state?.options?.language)
    
    if (callback_data) {
      nextSceneHandler.on(callback_data, async (value) => {
        ctx.wizard.state.nextScene = value;
        
        if (value === types.ADD_CODE_ADD_TO_DB && (!ctx.wizard.state.code_name || !ctx.wizard.state.code_name)) {
          ctx.wizard.state.nextScene = types.ADD_CODE;
          ctx.wizard.state.warning = ctx.i18n.t('code_create.data.warning_fill_all_fields');
        }
      })
    } else {
      await ctx.sendMessage(ctx.i18n.t('code_create.exit',{ menu_name: ctx.i18n.t('code_create.name',{ game_name:game.name }) }))
    }
    return done();
  },
);
