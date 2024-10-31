import { Context, Scenes } from 'telegraf';
import TelegrafI18n from 'telegraf-i18n';
import { WizardScene } from 'telegraf/scenes';
import { HandlerError } from '../exceptions/api-error';
import { Languages } from '../models/user/user-model';
import { ScenesTypes } from '../scenes';
import Slices from '../slices';

interface State {
  props: Record<string, unknown>,
  options: {
    language: Languages
  }
}
/*
type SomeInterface = Record<string, Exclude<boolean | number | string | Array<boolean | number | string>, Function>>
const someObject: SomeInterface = {
  test: []
};
*/
interface MyWizardSession<W> extends Scenes.WizardSessionData {
  // will be available under `ctx.scene.session.props`
  props?: W;
}
interface MySession<S, W> extends Scenes.WizardSession<MyWizardSession<W>> {
  // will be available under `ctx.session.props`
  props?: {
    prev_scenes: { name: string, data?: Record<string, unknown> }[],
    language: keyof typeof Languages
  },
}
export type CastProperty<SOURCE, PROPERTY, TYPE> = {
  [K in keyof SOURCE]: K extends PROPERTY ? TYPE : SOURCE[K];
};

export interface MyContext<C = {} ,S = {} ,W = {}> extends Context {
  // will be available under `ctx.props`
  props?: C;
  
  i18n: TelegrafI18n,
  
  // declare session type
  session: MySession<S,W>;
  // declare scene type
  scene: Scenes.SceneContextScene<MyContext<C, S, W>, MyWizardSession<W>>;
  // declare wizard type
  wizard: CastProperty<Scenes.WizardContextWizard<MyContext<C, S, W>>, "state", S>;
}

const unwrapCallback = async (ctx: MyContext, nextScene: string, props = {}) => {
  try {
    {
      const index = ctx.session.props.prev_scenes.findLastIndex((item) => item.name === ctx.session.__scenes.current)
      if( index !== -1 ) {
        ctx.session.props.prev_scenes[index].data = ctx.scene.session.props
      }
    }
    if (nextScene) {
      await ctx.scene.leave();
      ctx.scene.session.props = props
      return await ctx.scene.enter(nextScene, ctx.scene.state);
    };
    ctx.session.props.prev_scenes = []
    return ctx.scene.leave();
  } catch (e) {
    console.error(new HandlerError(400, 'Ошибка: завершение сцены', e))
  }
};

export type CustomMiddlewareFn<C extends Context> = (
  ctx: C,
  done: (nextScene?: string, state?:Record<string, unknown>) => Promise<unknown>,
  back: (scene?: string, state?:Record<string, unknown>) => Promise<unknown>,
  next: () => Promise<void>
) => Promise<unknown> | void

/**
 * Takes steps as arguments and returns a sceneFactory
 *
 * Additionally does the following things:
 * 1. Makes sure next step only triggers on `message` or `callbackQuery`
 * 2. Passes second argument - doneCallback to each step to be called when scene is finished
 */
export const composeWizardScene = <W = {}, S = {}>(...advancedSteps: CustomMiddlewareFn<MyContext<{}, S, W>>[]) => (
  /**
   * Branching extension enabled sceneFactory
   * @param sceneType {string}
   * @param nextScene {function} - async func that returns nextSceneType
   */
  function createWizardScene(sceneType, nextScene = (ctx) => undefined) {
    //@ts-ignore
    return new WizardScene<MyContext<{}, S, W>>(
      sceneType,
      ...advancedSteps.map((stepFn) => async (ctx, next) => {
        try {
          ctx.session.props = ctx.session.props || {}
          ctx.props = ctx.props || {}
          ctx.session.props = ctx.session.props || {}
          ctx.scene.session.props = ctx.scene.session.props || {}
          
          {
            if (!ctx.session.props.prev_scenes) ctx.session.props.prev_scenes = []
            if (ctx.session.props.prev_scenes[(ctx.session.props.prev_scenes?.length - 1) || 0]?.name !== ctx.session.__scenes.current) {
              ctx.session.props.prev_scenes.push({name: ctx.session.__scenes.current, data: ctx.scene.session.props})
            }
            if (ctx.session.props.prev_scenes.length > 10 ) {
              ctx.session.props.prev_scenes.splice(0, ctx.session.props.prev_scenes.length - 10)
            }
          }
          
          let language = ctx.session.props?.language
          
          if(!language) {
            const user = await Slices.user.crud.get({ chat_id: ctx.chat.id })
            language = Languages?.[user.item?.language] || 'ru'
          }
          
          ctx.session.props.language = language
          ctx.i18n.locale(language)
          
          /** ignore user action if it is neither message, nor callbackQuery */
          if (!ctx.message && !ctx.callbackQuery) return undefined;
          const nextSceneId = await nextScene(ctx);

          return stepFn(ctx, (nextScene?: string, state?:Record<string, unknown>) => unwrapCallback(ctx, nextScene || nextSceneId, state), (scene?: string, state?:Record<string, unknown>) => back(ctx, scene, state), next);
        } catch (e) {
          console.error(new HandlerError(400, 'Ошибка поиска сцены', e))
        }
      }),
    );
  }
);


const back = async (ctx: MyContext, scene_name?: string, state?:Record<string, unknown>) => {
  try {
    {
      const index = ctx.session.props.prev_scenes.findLastIndex((item) => item.name === ctx.session.__scenes.current)
      if( index !== -1 ) ctx.session.props.prev_scenes[index].data = ctx.scene.session.props
    }
    if (scene_name) {
      const index = ctx.session.props.prev_scenes.findLastIndex((item) => item.name === scene_name)
      if ( index !== -1 ) {
        ctx.session.props.prev_scenes.splice(index + 1, (ctx.session.props.prev_scenes.length - (index - 1)) || 0)
      } else {
        ctx.session.props.prev_scenes = [{name: scene_name}]
      }
    } else {
      if (ctx.session.props.prev_scenes.length > 1) {
        ctx.session.props.prev_scenes.splice(ctx.session.props.prev_scenes.length - 1, 1)
      }
    }
    await ctx.scene.leave()
    
    ctx.session.props.prev_scenes.map((scene, index) => {
      if ( scene.name === ScenesTypes.mandatorySubscription.wizard.MANDATORY ) {
        ctx.session.props.prev_scenes.splice(index, 1)
      }
    })
    ctx.scene.session.props = state || ctx.session.props.prev_scenes[ctx.session.props.prev_scenes.length - 1].data
    
    return await ctx.scene.enter(ctx.session.props.prev_scenes[ctx.session.props.prev_scenes.length - 1].name, ctx.scene.state);
  } catch (e) {
    console.error(new HandlerError(400, 'Ошибка: завершение сцены', e))
  }
}