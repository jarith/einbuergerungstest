import { statusBadge as statusBadgeRecipe } from '../../../styled-system/recipes'

export const statusBadge = (...args: Parameters<typeof statusBadgeRecipe>) =>
  statusBadgeRecipe(...args)
