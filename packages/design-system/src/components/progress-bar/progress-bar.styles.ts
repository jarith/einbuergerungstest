import { progressBar as progressBarRecipe } from '../../../styled-system/recipes'

export const progressBar = (...args: Parameters<typeof progressBarRecipe>) =>
  progressBarRecipe(...args)
