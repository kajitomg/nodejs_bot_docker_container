import { Markup } from 'telegraf';
import { bold, fmt, italic } from 'telegraf/format';
import { CallbackQueryWrapper } from '../../../helpers/callback-wrapper';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import { genMessage } from '../../../helpers/create-message-sample';
import sendMessage from '../../../helpers/send-message';
import { ICode } from '../../../models/code/code-model';
import { Game } from '../../../models/game';
import types from './types';

const nextSceneHandler = CallbackQueryWrapper.nextSceneHandler()

interface CodeSuggestProps {
  game: Game,
  code?: Partial<Pick<ICode, 'name' | 'content'>>,
  warning?: string,
  entry: string,
}

export const createGiveCodeScene = composeWizardScene<CodeSuggestProps>(
  async (ctx) => {
    const game = ctx.scene.session?.props?.game
    
    if (!ctx.scene.session?.props?.code) ctx.scene.session.props.code = {}
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback(ctx.i18n.t('code_suggest.buttons.change', {value: ctx.i18n.t('code_suggest.data.name')}), nextSceneHandler.create(types.GIVE_CODE_NAME)),
        Markup.button.callback(ctx.i18n.t('code_suggest.buttons.change', {value: ctx.i18n.t('code_suggest.data.content')}), nextSceneHandler.create(types.GIVE_CODE_CONTENT)),
        Markup.button.callback(ctx.i18n.t('code_suggest.buttons.back'), 'back'),
        Markup.button.callback(ctx.i18n.t('code_suggest.buttons.suggest'), nextSceneHandler.create(types.GIVE_CODE_ADD_TO_DB)),
      ],{ columns: 2 }
    )
    
    const text = genMessage({
      header: bold(ctx.i18n.t('code_suggest.name',{ game_name:game?.name })),
      body: fmt(fmt(`- ${ctx.i18n.t('code_suggest.data.name')}${ctx.scene.session?.props?.code?.name ? '' : '*'}: `), bold(ctx.scene.session?.props?.code?.name ? ctx.scene.session?.props?.code?.name : '-'),fmt('\n'),fmt(`- ${ctx.i18n.t('code_suggest.data.content')}${ctx.scene.session?.props?.code?.content ? '' : '*'}: `), bold(ctx.scene.session?.props?.code?.content ? ctx.scene.session?.props?.code?.content : '-')),
      ...(ctx.scene.session?.props?.warning && {footer: italic(`${ctx.scene.session?.props?.warning}*`)})
    })
    
    await sendMessage(ctx, {
      text,
      extra: markup
    })
    
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const game = ctx.scene.session?.props?.game
    const callback_data = ctx.callbackQuery?.['data'];
    
    if (callback_data) {
      if (callback_data === 'back') {
        await back(ctx.scene.session?.props.entry);
      }
      
      await nextSceneHandler.on(callback_data, async (value) => {
        await done(value, {
          game,
          code: ctx.scene.session?.props.code,
          entry: ctx.scene.session.props.entry,
        })
        
        if (value === types.GIVE_CODE_ADD_TO_DB && (!ctx.scene.session.props.code.name || ! ctx.scene.session.props.code.content)) {
          await done(types.GIVE_CODE, {
            ...ctx.scene.session.props,
            warning: ctx.i18n.t('code_suggest.data.warning_fill_all_fields')
          })
        }
      })
    } else {
      await ctx.sendMessage(ctx.i18n.t('code_suggest.exit',{ menu_name: ctx.i18n.t('code_suggest.name',{ game_name:game.name }) }))
      await done();
    }
    return;
  },
);