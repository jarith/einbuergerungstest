import { navigationItem as navigationItemRecipe } from '../../../styled-system/recipes'

export const navigationItem = (...args: Parameters<typeof navigationItemRecipe>) =>
  navigationItemRecipe(...args)
