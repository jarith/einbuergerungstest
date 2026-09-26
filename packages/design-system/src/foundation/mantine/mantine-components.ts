import { Input } from '@mantine/core'

import { token } from '../panda/styling'

// Mantine 9.6 InputBase does not forward instance vars to Input. Bind the public
// variable at the shared Input theme seam so its inline value remains canonical.
export const mantineComponents = {
  Input: Input.extend({
    vars: () => ({ wrapper: { '--input-height': token.var('sizes.control.field') } }),
  }),
}
