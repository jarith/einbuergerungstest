import { definePlugin } from '@oxlint/plugins'

/* oxlint-disable import/no-default-export */
import { rule as atomNamingRule } from './atom-naming/rule.ts'
import { rule as componentFolderStructureRule } from './component-folder-structure/rule.ts'
import { rule as noArrayFilterMapRule } from './no-array-filter-map/rule.ts'
import { rule as noAtomInPropsRule } from './no-atom-in-props/rule.ts'
import { rule as noChainedTypeAssertionsRule } from './no-chained-type-assertions/rule.ts'
import { rule as noConditionalJsxReturnRule } from './no-conditional-jsx-return/rule.ts'
import { rule as noHardcodedDesignLiteralsRule } from './no-hardcoded-design-literals/rule.ts'
import { rule as noInlineTypesRule } from './no-inline-types/rule.ts'
import { rule as noKnownValueWideningRule } from './no-known-value-widening/rule.ts'
import { rule as noModuleMockingRule } from './no-module-mocking/rule.ts'
import { rule as noObjectParametersRule } from './no-object-parameters/rule.ts'
import { rule as noReduceAccumulatorCopyRule } from './no-reduce-accumulator-copy/rule.ts'
import { rule as noReexportOutsideIndexRule } from './no-reexport-outside-index/rule.ts'
import { rule as noReflectApplyRule } from './no-reflect-apply/rule.ts'
import { rule as noReflectGetRule } from './no-reflect-get/rule.ts'
import { rule as noRuntimeTypeofRule } from './no-runtime-typeof/rule.ts'
import { rule as noForbiddenTermInSymbolNamesRule } from './no-shape-in-symbol-names/rule.ts'
import { rule as noUnknownParametersRule } from './no-unknown-parameters/rule.ts'
import { rule as noUnknownReturnsRule } from './no-unknown-returns/rule.ts'
import { rule as noUnknownTypeAliasesRule } from './no-unknown-type-aliases/rule.ts'
import { rule as noUnsafeDictionaryTypeRule } from './no-unsafe-dictionary-type/rule.ts'
import { rule as preferArrayMethodsRule } from './prefer-array-methods/rule.ts'
import { rule as requireActionForSetRule } from './require-action-for-set/rule.ts'
import { rule as requireSafetyCommentForTypeAssertionRule } from './require-safety-comment-for-type-assertion/rule.ts'

const plugin = definePlugin({
  meta: { name: 'app' },
  rules: {
    'no-array-filter-map': noArrayFilterMapRule,
    'no-chained-type-assertions': noChainedTypeAssertionsRule,
    'no-known-value-widening': noKnownValueWideningRule,
    'no-module-mocking': noModuleMockingRule,
    'no-object-parameters': noObjectParametersRule,
    'no-reduce-accumulator-copy': noReduceAccumulatorCopyRule,
    'no-reflect-apply': noReflectApplyRule,
    'no-reflect-get': noReflectGetRule,
    'no-runtime-typeof': noRuntimeTypeofRule,
    'no-shape-in-symbol-names': noForbiddenTermInSymbolNamesRule,
    'no-unknown-parameters': noUnknownParametersRule,
    'no-unknown-returns': noUnknownReturnsRule,
    'no-unknown-type-aliases': noUnknownTypeAliasesRule,
    'no-unsafe-dictionary-type': noUnsafeDictionaryTypeRule,
    'require-safety-comment-for-type-assertion': requireSafetyCommentForTypeAssertionRule,
    'atom-naming': atomNamingRule,
    'component-folder-structure': componentFolderStructureRule,
    'no-atom-in-props': noAtomInPropsRule,
    'no-hardcoded-design-literals': noHardcodedDesignLiteralsRule,
    'no-conditional-jsx-return': noConditionalJsxReturnRule,
    'no-inline-types': noInlineTypesRule,
    'no-reexport-outside-index': noReexportOutsideIndexRule,
    'prefer-array-methods': preferArrayMethodsRule,
    'require-action-for-set': requireActionForSetRule,
  },
})

export default plugin
