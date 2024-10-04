import { BroadcastWizardScenes, BroadcastScenesTypes } from './broadcast';
import { MenuScenesTypes, MenuWizardScenes } from './menu';
import { TapSwapScenesTypes, TapSwapWizardScenes } from './tap-swap';
import { XEmpireScenesTypes, XEmpireWizardScenes } from './x-empire';
import { BlumScenesTypes, BlumWizardScenes } from './blum';
import { CodeScenesTypes, CodeWizardScenes } from './code';
import { LanguageScenesTypes, LanguageWizardScenes } from './language';
import { MandatorySubscriptionScenesTypes, MandatorySubscriptionWizardScenes } from './mandatory-subscription';

export const WizardScenes = [
  ...MenuWizardScenes,
  ...TapSwapWizardScenes,
  ...XEmpireWizardScenes,
  ...BlumWizardScenes,
  ...CodeWizardScenes,
  ...LanguageWizardScenes,
  ...MandatorySubscriptionWizardScenes,
  ...BroadcastWizardScenes,
]

export const ScenesTypes = {
  menu: MenuScenesTypes,
  tapSwap: TapSwapScenesTypes,
  xEmpire: XEmpireScenesTypes,
  blum: BlumScenesTypes,
  code: CodeScenesTypes,
  language: LanguageScenesTypes,
  mandatorySubscription: MandatorySubscriptionScenesTypes,
  broadcast: BroadcastScenesTypes,
}