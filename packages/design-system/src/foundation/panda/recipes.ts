import { buttonRecipe } from '../../components/button/button.recipe'
import { panelRecipe } from '../../components/panel/panel.recipe'
import { fieldRecipe } from '../../recipes/field/field.recipe'
import { inputRecipe } from '../../recipes/input/input.recipe'

/** Keep configuration pure: register recipe definitions, never render modules. */
export const slotRecipes = {
  button: buttonRecipe,
  panel: panelRecipe,
  field: fieldRecipe,
  input: inputRecipe,
}
