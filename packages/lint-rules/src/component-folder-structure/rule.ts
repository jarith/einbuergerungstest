import type { Context, ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

import { existsSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'

const PATH_SEPARATOR = /[/\\]/u

const TEST_FILE_PATTERN = /\.test\.tsx?$/u

const isInScope = (filename: string) =>
  /[/\\]packages[/\\]web[/\\]src[/\\]/u.test(filename) ||
  /[/\\]packages[/\\]design-system[/\\]src[/\\]components[/\\]/u.test(filename)

const isExcludedFile = (filename: string) =>
  filename.endsWith('.route.tsx') || basename(filename) === 'main.tsx'

const getParentFolderName = (filename: string) => basename(dirname(filename))

const getComponentNameFromTestFile = (filename: string) =>
  basename(filename).replace(/(?:\.browser)?\.test\.tsx?$/u, '')

const isComponentTestFile = (filename: string) =>
  /[/\\]packages[/\\]web[/\\]src[/\\].*[/\\]ui[/\\]/u.test(filename) ||
  /[/\\]packages[/\\]design-system[/\\]src[/\\]components[/\\]/u.test(filename)

const isInsideTestsFolder = (filename: string) => {
  const segments = filename.split(PATH_SEPARATOR)
  const testsIndex = segments.lastIndexOf('tests')

  if (testsIndex <= 0) {
    return false
  }

  const componentFolder = segments[testsIndex - 1]
  const componentName = getComponentNameFromTestFile(filename)

  return componentFolder === componentName
}

const reportInvalidComponentPath = (context: Context, node: ESTree.Program) => {
  context.report({
    node,
    message:
      'Component implementation files must live at "/<component-name>/<component-name>.tsx".',
  })
}

const reportMissingStylesFile = (context: Context, node: ESTree.Program, componentName: string) => {
  context.report({
    node,
    message: `Component "${componentName}" must have a sibling "${componentName}.styles.ts" file.`,
  })
}

const reportInvalidTestLocation = (context: Context, node: ESTree.Program) => {
  context.report({
    node,
    message: 'Component tests must live in a "tests/" subfolder under their component folder.',
  })
}

const checkTestFile = (context: Context, node: ESTree.Program, filename: string) => {
  if (!isComponentTestFile(filename)) {
    return
  }

  if (!isInsideTestsFolder(filename)) {
    reportInvalidTestLocation(context, node)
  }
}

const checkComponentImplementation = (context: Context, node: ESTree.Program, filename: string) => {
  if (!filename.endsWith('.tsx')) {
    return
  }

  const componentName = basename(filename, '.tsx')
  const folderName = getParentFolderName(filename)

  if (folderName !== componentName) {
    reportInvalidComponentPath(context, node)

    return
  }

  const stylesPath = join(dirname(filename), `${componentName}.styles.ts`)

  if (!existsSync(stylesPath)) {
    reportMissingStylesFile(context, node, componentName)
  }
}

export const rule = defineRule({
  create(context) {
    return {
      Program(node) {
        const { filename } = context

        if (!isInScope(filename) || isExcludedFile(filename)) {
          return
        }

        if (TEST_FILE_PATTERN.test(filename)) {
          checkTestFile(context, node, filename)

          return
        }

        checkComponentImplementation(context, node, filename)
      },
    }
  },
})
