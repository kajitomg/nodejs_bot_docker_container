import { BroadcastWizardScenes, BroadcastScenesTypes } from './broadcast';
import { MenuScenesTypes, MenuWizardScenes } from './menu';
import { TapSwapScenesTypes, TapSwapWizardScenes } from './tap-swap';
import { BlumScenesTypes, BlumWizardScenes } from './blum';
import { CatsScenesTypes, CatsWizardScenes } from './cats';
import { HotScenesTypes, HotWizardScenes } from './hot';
import { CityHolderScenesTypes, CityHolderWizardScenes } from './city-holder';
import { HamsterKombatScenesTypes, HamsterKombatWizardScenes } from './hamster-kombat';
import { PawsScenesTypes, PawsWizardScenes } from './paws';
import { BumsScenesTypes, BumsWizardScenes } from './bums';
import { CodeScenesTypes, CodeWizardScenes } from './code';
import { LanguageScenesTypes, LanguageWizardScenes } from './language';
import { MandatorySubscriptionScenesTypes, MandatorySubscriptionWizardScenes } from './mandatory-subscription';
import { ActivityTypes, ActivityWizardScenes } from './activity';
import { PostScenesTypes, PostWizardScenes } from './post';
import { TestScenesTypes, TestWizardScenes } from './test';

export const WizardScenes = [
  ...MenuWizardScenes,
  ...TapSwapWizardScenes,
  ...BlumWizardScenes,
  ...CodeWizardScenes,
  ...LanguageWizardScenes,
  ...MandatorySubscriptionWizardScenes,
  ...BroadcastWizardScenes,
  ...ActivityWizardScenes,
  ...PostWizardScenes,
  ...TestWizardScenes,
  ...CatsWizardScenes,
  ...HotWizardScenes,
  ...CityHolderWizardScenes,
  ...HamsterKombatWizardScenes,
  ...PawsWizardScenes,
  ...BumsWizardScenes,
]

export const ScenesTypes = {
  menu: MenuScenesTypes,
  tapSwap: TapSwapScenesTypes,
  blum: BlumScenesTypes,
  code: CodeScenesTypes,
  language: LanguageScenesTypes,
  mandatorySubscription: MandatorySubscriptionScenesTypes,
  broadcast: BroadcastScenesTypes,
  activity: ActivityTypes,
  post: PostScenesTypes,
  test: TestScenesTypes,
  cats: CatsScenesTypes,
  hot: HotScenesTypes,
  cityholder: CityHolderScenesTypes,
  hamsterkombat: HamsterKombatScenesTypes,
  paws: PawsScenesTypes,
  bums: BumsScenesTypes,
}