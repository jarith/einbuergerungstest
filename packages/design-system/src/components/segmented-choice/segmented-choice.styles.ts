import { segmentedChoice as segmentedChoiceRecipe } from '../../../styled-system/recipes'

export const segmentedChoice = (...args: Parameters<typeof segmentedChoiceRecipe>) =>
  segmentedChoiceRecipe(...args)
