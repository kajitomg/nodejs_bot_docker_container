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

interface CodeCreateEndDialogProps {
  game: Game,
  code: Partial<Pick<ICode, 'name' | 'content'>>,
  result: number,
  entry: string,
}

export const createAddCodeEndDialogScene = composeWizardScene<CodeCreateEndDialogProps>(
  async (ctx) => {
    const game = ctx.scene.session?.props?.game
    
    const markup = Markup.inlineKeyboard(
      [
        Markup.button.callback(ctx.i18n.t('code_create.buttons.back_to',{ menu_name: ctx.i18n.t('game.name',{ game_name: game.name }) }), 'back_to'),
        Markup.button.callback(ctx.i18n.t('code_create.buttons.create_new'), nextSceneHandler.create(types.ADD_CODE)),
      ],{ columns: 2 }
    )
    const text = genMessage({
      header: genMessage({
        header: bold(ctx.i18n.t('code_create.name',{ game_name:game.name })),
        body: italic(ctx.i18n.t(`code_create.data.warning_end_dialog.${ctx.scene.session?.props.result}`)),
      }),
      body: fmt(fmt(`- ${ctx.i18n.t('code_create.data.name')}${ctx.scene.session?.props.code.name ? '' : '*'}: `), bold(ctx.scene.session?.props.code.name ? ctx.scene.session?.props.code.name : '-'),fmt('\n\n'),fmt(`- ${ctx.i18n.t('code_create.data.content')}${ctx.scene.session?.props.code.content ? '' : '*'}: `), bold(ctx.scene.session?.props.code.content ? ctx.scene.session?.props.code.content : '-')),
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
      if (callback_data === 'back_to') {
        await back(ctx.scene.session.props.entry)
      }
      await nextSceneHandler.on(callback_data, async (value) => {
        await done(value, {
          game
        });
      })
    } else {
      await ctx.sendMessage(ctx.i18n.t('code_create.exit',{ menu_name: ctx.i18n.t('code_create.name',{ game_name:game.name }) }))
      await done();
    }
    return;
  },
);