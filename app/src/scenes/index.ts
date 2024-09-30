import { BroadcastWizardScenes, BroadcastScenesTypes } from './broadcast';
import { MenuScenesTypes, MenuWizardScenes } from './menu';
import { TapSwapScenesTypes, TapSwapWizardScenes } from './tap-swap';
import { XEmpireScenesTypes, XEmpireWizardScenes } from './x-empire';
import { BlumScenesTypes, BlumWizardScenes } from './blum';
import { CodeScenesTypes, CodeWizardScenes } from './code';
import { LanguageScenesTypes, LanguageWizardScenes } from './language';
import { MandatoryChannelScenesTypes, MandatoryChannelWizardScenes } from './mandatory-channel';

export const WizardScenes = [
  ...MenuWizardScenes,
  ...TapSwapWizardScenes,
  ...XEmpireWizardScenes,
  ...BlumWizardScenes,
  ...CodeWizardScenes,
  ...LanguageWizardScenes,
  ...MandatoryChannelWizardScenes,
  ...BroadcastWizardScenes,
]

export const ScenesTypes = {
  menu: MenuScenesTypes,
  tapSwap: TapSwapScenesTypes,
  xEmpire: XEmpireScenesTypes,
  blum: BlumScenesTypes,
  code: CodeScenesTypes,
  language: LanguageScenesTypes,
  mandatoryChannel: MandatoryChannelScenesTypes,
  broadcast: BroadcastScenesTypes,
}