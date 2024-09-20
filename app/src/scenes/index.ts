import { MenuScenesTypes, MenuWizardScenes } from './menu';
import { TapSwapScenesTypes, TapSwapWizardScenes } from './tap-swap';
import { XEmpireScenesTypes, XEmpireWizardScenes } from './x-empire';
import { BlumScenesTypes, BlumWizardScenes } from './blum';
import { CodeScenesTypes, CodeWizardScenes } from './code';

export const WizardScenes = [
  ...MenuWizardScenes,
  ...TapSwapWizardScenes,
  ...XEmpireWizardScenes,
  ...BlumWizardScenes,
  ...CodeWizardScenes,
]

export const ScenesTypes = {
  menu: MenuScenesTypes,
  tapSwap: TapSwapScenesTypes,
  xEmpire: XEmpireScenesTypes,
  blum: BlumScenesTypes,
  code: CodeScenesTypes,
}