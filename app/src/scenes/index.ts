import { MenuScenesTypes, MenuWizardScenes } from './menu';
import { TapSwapScenesTypes, TapSwapWizardScenes } from './tap-swap';
import { XEmpireScenesTypes, XEmpireWizardScenes } from './x-empire';
import { BlumWizardScenes, BlumScenesTypes } from './blum';

export const WizardScenes = [
  ...MenuWizardScenes,
  ...TapSwapWizardScenes,
  ...XEmpireWizardScenes,
  ...BlumWizardScenes,
]

export const ScenesTypes = {
  menu: MenuScenesTypes,
  tapSwap: TapSwapScenesTypes,
  xEmpire: XEmpireScenesTypes,
  blum: BlumScenesTypes,
}