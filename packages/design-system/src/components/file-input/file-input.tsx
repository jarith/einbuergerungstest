import type { FileInputProps as MantineFileInputProps } from '@mantine/core'
import { FileInput as MantineFileInput } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { fieldClasses } from './file-input.styles'

export type FileInputProps = PrimitiveProps<MantineFileInputProps>

/** A labeled local file picker for importing a backup. */
export const FileInput = (props: FileInputProps) => (
  <MantineFileInput {...props} classNames={fieldClasses()} />
)
