import { Markup } from 'telegraf';
import { bold, code, fmt, FmtString, italic } from 'telegraf/format';
import codeController from '../../../controllers/code-controller';
import { HandlerError } from '../../../exceptions/api-error';
import { composeWizardScene } from '../../../helpers/compose-wizard-scene';
import createListMessage from '../../../helpers/create-list-message';
import { createMessageSample, genMessage } from '../../../helpers/create-message-sample';
import MarkupPagination from '../../../helpers/markup-pagination';
import send from '../../../helpers/send';
import { CodeStatuses } from '../../../models/code';
import { Game } from '../../../models/game';
import types from './types';

const limit = 25

interface CodeGetAllProps {
  game: Game,
  pagination: MarkupPagination,
  sample: createMessageSample<{page?: number, max_pages?: number, content?: FmtString}>,
  count: number,
  count_prev: number,
  force_update: boolean,
}

export const createGetAllCodesScene = composeWizardScene<CodeGetAllProps>(
  async (ctx, done) => {
    const game = ctx.scene.session?.props?.game
    
    if (!game) {
      console.error(new HandlerError(400, 'Ошибка: отсутствует поле game'))
      return done();
    }
    try {
      ctx.scene.session.props.pagination = new MarkupPagination(
        ctx.scene.session.props.pagination?._page || 1,
        ctx.scene.session.props.pagination?._maxPages || 1,
        ctx.scene.session.props.pagination?.prevMaxPages,
        ctx.scene.session.props.pagination?.prevPage
      )
      ctx.scene.session.props.sample = new createMessageSample({
        content_wait: fmt(ctx.i18n.t('code_get_all.data.loader')),
        data: {
          page: ctx.scene.session.props.pagination.page || ctx.scene.session.props.sample?._data.page,
          max_pages: ctx.scene.session.props.pagination.maxPages || ctx.scene.session.props.sample?._data.max_pages,
          ...(ctx.scene.session.props.sample?._data.content && {content: new FmtString(ctx.scene.session.props.sample?._data.content.text, ctx.scene.session.props.sample?._data.content.entities)}),
        },
        sample: (data?:{
          page?: number,
          max_pages?: number,
          content?: FmtString
        }) => {
          const markup = Markup.inlineKeyboard(
            [
              ctx.scene.session.props.pagination.prevPageButton(),
              Markup.button.callback(`${data?.page || '*'}/${data?.max_pages  || data?.page || '*'}(↻)`, 'force_update'),
              ctx.scene.session.props.pagination.nextPageButton(),
              Markup.button.callback(ctx.i18n.t('code_get_all.buttons.back'), 'back'),
            ],{ columns: 3 }
          )
          
          const text = genMessage({
            header: bold(ctx.i18n.t('code_get_all.name',{ game_name: game.name })),
            ...(data.content && {body: data.content})
          })
          
          return {
            text,
            reply_markup: markup.reply_markup
          }
        },
      })
      
      ctx.scene.session.props.sample.is_loading = true
      await send(ctx,  ctx.scene.session.props.sample.result.text, { reply_markup:  ctx.scene.session.props.sample.result.reply_markup })
      
      const count = await codeController.getCount({
        game: game.id,
        status: CodeStatuses.accept
      })
      
      ctx.scene.session.props.count_prev =  ctx.scene.session.props.count
      ctx.scene.session.props.count = count.count
      ctx.scene.session.props.pagination.maxPages = Math.ceil(count.count / limit) || 1
      
      const isNeedUpdate = (!ctx.scene.session.props.force_update && (ctx.scene.session.props.pagination.prevPage !== ctx.scene.session.props.pagination.page)) || (ctx.scene.session.props.force_update && (ctx.scene.session.props.pagination.prevMaxPages !== ctx.scene.session.props.pagination.maxPages) || (ctx.scene.session.props.force_update && (ctx.scene.session.props.count_prev !== ctx.scene.session.props.count) && (ctx.scene.session.props.pagination.maxPages === ctx.scene.session.props.pagination.page)))
      
      if (isNeedUpdate) {
        const codes = await codeController.getCodes({
          game: game.id,
          status: CodeStatuses.accept
        },{
          page: ctx.scene.session.props.pagination.page,
          limit
        })
        
        const text = codes?.items?.length > 0 ? genMessage({
          body: genMessage({
            //@ts-ignore
            body: createListMessage({ list: codes.items, convertFn: (key, i) => fmt( (ctx.scene.session.props.pagination.page - 1) * limit + (i + 1), '. ', key.name, ': ', code(key.content) )},),
            footer: italic(ctx.i18n.t('code_get_all.data.warning_to_copy_click_on_code'))
          }),
          footer: bold(`${ctx.i18n.t('code_get_all.data.codes_pagination')} `,(ctx.scene.session.props.pagination.page - 1) * limit + 1,'-',(ctx.scene.session.props.pagination.page - 1) * limit + codes.items?.length, ' / ', ctx.scene.session.props.count) ,
        }) : fmt(ctx.i18n.t('code_get_all.data.warning_codes_not_found'))
        
        ctx.scene.session.props.sample.data = {
          content: text,
          max_pages: ctx.scene.session.props.pagination.maxPages,
          page: ctx.scene.session.props.pagination.page
        }
        ctx.scene.session.props.sample.is_loading = false
        
        await send(ctx, ctx.scene.session.props.sample.result.text, { reply_markup: ctx.scene.session.props.sample.result.reply_markup})
      }
      
      if (ctx.scene.session.props.force_update) {
        ctx.scene.session.props.force_update = false
      }
      if (ctx.scene.session.props.sample.is_loading) {
        ctx.scene.session.props.sample.is_loading = false
        await send(ctx, ctx.scene.session.props.sample.result.text, { reply_markup: ctx.scene.session.props.sample.result.reply_markup })
      }
      
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Получение кодов', e))
    }
    
    return ctx.wizard.next();
  },
  async (ctx, done, back) => {
    const game = ctx.scene.session?.props?.game
    if (!game) {
      console.error(new HandlerError(400, 'Ошибка: отсутствует поле game'))
      return done();
    }
    
    const callback_data = ctx.callbackQuery?.['data'];
    
    ctx.scene.session.props.pagination = new MarkupPagination(
      ctx.scene.session.props.pagination?._page || 1,
      ctx.scene.session.props.pagination?._maxPages || 1,
      ctx.scene.session.props.pagination?.prevMaxPages,
      ctx.scene.session.props.pagination?.prevPage
    )
    
    try {
      if (callback_data) {
        
        await ctx.scene.session.props.pagination.onPrevPage(callback_data, async () => {})
        await ctx.scene.session.props.pagination.onNextPage(callback_data, async () => {})
        await done(types.GET_ALL_CODES, {
          ...ctx.scene.session.props
        });
        if (callback_data === 'force_update') {
          await done(types.GET_ALL_CODES, {
            ...ctx.scene.session.props,
            force_update: true
          });
        }
        if (callback_data === 'back') {
          await back();
        }
      } else {
        await ctx.sendMessage(ctx.i18n.t('code_get_all.exit',{ menu_name: ctx.i18n.t('code_get_all.name',{ game_name: game.name }) }))
        await done();
      }
    } catch (e) {
      console.error(new HandlerError(400, 'Ошибка: Получение кодов', e))
    }
    
    return;
  },
);