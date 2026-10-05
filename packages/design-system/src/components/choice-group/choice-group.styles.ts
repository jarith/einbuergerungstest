import {
  choiceGroup as choiceGroupRecipe,
  field as fieldRecipe,
} from '../../../styled-system/recipes'
import { css } from '../../foundation/panda/styling'

export const hiddenLabel = css({ srOnly: true })

export const choiceGroup = (...args: Parameters<typeof choiceGroupRecipe>) =>
  choiceGroupRecipe(...args)

export const choiceField = () => fieldRecipe()
