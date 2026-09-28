import {
  choiceGroup as choiceGroupRecipe,
  field as fieldRecipe,
} from '../../../styled-system/recipes'

export const choiceGroup = (...args: Parameters<typeof choiceGroupRecipe>) =>
  choiceGroupRecipe(...args)

export const choiceField = () => fieldRecipe()
