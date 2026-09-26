import { buttonRecipe } from '../../components/button/button.recipe'
import { choiceGroupRecipe } from '../../components/choice-group/choice-group.recipe'
import { dialogRecipe } from '../../components/dialog/dialog.recipe'
import { dividerRecipe } from '../../components/divider/divider.recipe'
import { iconButtonRecipe } from '../../components/icon-button/icon-button.recipe'
import { inlineNoticeRecipe } from '../../components/inline-notice/inline-notice.recipe'
import { navigationItemRecipe } from '../../components/navigation-item/navigation-item.recipe'
import { panelRecipe } from '../../components/panel/panel.recipe'
import { progressBarRecipe } from '../../components/progress-bar/progress-bar.recipe'
import { segmentedChoiceRecipe } from '../../components/segmented-choice/segmented-choice.recipe'
import { statusBadgeRecipe } from '../../components/status-badge/status-badge.recipe'
import { toggleSwitchRecipe } from '../../components/toggle-switch/toggle-switch.recipe'
import { fieldRecipe } from '../../recipes/field/field.recipe'
import { inputRecipe } from '../../recipes/input/input.recipe'

/** Keep configuration pure: register recipe definitions, never render modules. */
export const slotRecipes = {
  button: buttonRecipe,
  choiceGroup: choiceGroupRecipe,
  dialog: dialogRecipe,
  separator: dividerRecipe,
  iconButton: iconButtonRecipe,
  inlineNotice: inlineNoticeRecipe,
  navigationItem: navigationItemRecipe,
  panel: panelRecipe,
  progressBar: progressBarRecipe,
  segmentedChoice: segmentedChoiceRecipe,
  statusBadge: statusBadgeRecipe,
  toggleSwitch: toggleSwitchRecipe,
  field: fieldRecipe,
  input: inputRecipe,
}
