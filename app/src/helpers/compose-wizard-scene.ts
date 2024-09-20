import { WizardScene } from 'telegraf/scenes';


const unwrapCallback = async (ctx, nextScene = (ctx) => undefined) => {
  try {
    const nextSceneId = await Promise.resolve(nextScene(ctx));
    if (nextSceneId) {
      ctx.scene.leave();
      return ctx.scene.enter(nextSceneId, ctx.scene.state);
    };
    return ctx.scene.leave();
  } catch (e) {
    console.log(e)
  }
};

/**
 * Takes steps as arguments and returns a sceneFactory
 *
 * Additionally does the following things:
 * 1. Makes sure next step only triggers on `message` or `callbackQuery`
 * 2. Passes second argument - doneCallback to each step to be called when scene is finished
 */
export const composeWizardScene = (...advancedSteps) => (
  /**
   * Branching extension enabled sceneFactory
   * @param sceneType {string}
   * @param nextScene {function} - async func that returns nextSceneType
   */
  function createWizardScene(sceneType, nextScene = (ctx) => undefined) {
    return new WizardScene(
      sceneType,
      ...advancedSteps.map((stepFn) => async (ctx, next) => {
        try {
          {
            if (ctx.wizard.state.currentScene) {
              ctx.wizard.state.prevScene = ctx.wizard.state.currentScene
              delete ctx.wizard.state.currentScene
            }
            if (ctx.wizard.state.nextScene) {
              ctx.wizard.state.currentScene = ctx.wizard.state.nextScene
              delete ctx.wizard.state.nextScene
            }
          }
          
          /** ignore user action if it is neither message, nor callbackQuery */
          if (!ctx.message && !ctx.callbackQuery) return undefined;

          return stepFn(ctx, () => unwrapCallback(ctx, nextScene), next);
        } catch (e) {
          console.log(e)
        }
      }),
    );
  }
);