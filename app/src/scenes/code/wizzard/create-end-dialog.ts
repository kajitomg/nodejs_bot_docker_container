import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import { createNextScene, getNextScene } from '../../../helpers/next-scene';
import send from '../../../helpers/send';
import { Languages } from '../../../models/user/user-model';
import Slices from '../../../slices';
import types from './types';

const variants = {
  0:'Произошла ошибка при добавлении кода!',
  1:'Код успешно добавлен!'
}

export const createAddCodeEndDialogScene = composeWizardScene(
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
        Markup.button.callback(ctx.i18n.t('code_create.buttons.back_to',{ menu_name: ctx.i18n.t('game.name',{ game_name: game.name }) }), createNextScene(ctx.wizard.state.options.entry)),
        Markup.button.callback(ctx.i18n.t('code_create.buttons.create_new'), createNextScene(types.ADD_CODE)),
      ],{ columns: 2 }
    )
    const text = genMessage({
      header: genMessage({
        header: bold(ctx.i18n.t('code_create.name',{ game_name:game.name })),
        body: italic(ctx.i18n.t(`code_create.data.warning_end_dialog.${ctx.wizard.state.add_code_result}`)),
      }),
      body: fmt(fmt(`- ${ctx.i18n.t('code_create.data.name')}${ctx.wizard.state.code_name ? '' : '*'}: `), bold(ctx.wizard.state.code_name ? ctx.wizard.state.code_name : '-'),fmt('\n\n'),fmt(`- ${ctx.i18n.t('code_create.data.content')}${ctx.wizard.state.code_content ? '' : '*'}: `), bold(ctx.wizard.state.code_content ? ctx.wizard.state.code_content : '-')),
    })
    
    await send(ctx, text, { parse_mode: 'MarkdownV2', reply_markup: markup.reply_markup })
    
    delete ctx.wizard.state?.code_name
    delete ctx.wizard.state?.code_content
    delete ctx.wizard.state?.add_code_result
    
    return ctx.wizard.next();
  },
  async (ctx, done) => {
    const game = ctx.wizard.state.options.game
    const callback_data = ctx.update?.callback_query?.data;
    
    ctx.i18n.locale(ctx.scene.state?.options?.language)
    
    if (callback_data) {
      const nextScene = getNextScene(callback_data)
      if (nextScene) {
        ctx.wizard.state.nextScene = nextScene;
      }
    } else {
      await ctx.sendMessage(ctx.i18n.t('code_create.exit',{ menu_name: ctx.i18n.t('code_create.name',{ game_name:game.name }) }))
    }
    return done();
  },
);