import { Button, Panel } from '@app/design-system'
import { wrap } from '@reatom/core'
import { reatomComponent, reatomFactoryComponent } from '@reatom/react'

import { createCounterModel } from './counter.model'
import { counterStyles } from './counter.styles'

type CounterViewProps = Readonly<{ model: ReturnType<typeof createCounterModel> }>

const CounterView = reatomComponent(
  ({ model }: CounterViewProps) => (
    <Panel className={counterStyles.content} aria-label="Counter">
      <h2 className={counterStyles.heading}>Make a little progress</h2>
      <p className={counterStyles.label}>A small starting point for your next idea.</p>
      <output className={counterStyles.value} aria-label="Count" aria-live="polite">
        {model()}
      </output>
      <p className={counterStyles.label}>Doubled: {model.doubled()}</p>
      <div className={counterStyles.actions}>
        <Button onClick={wrap(model.increment)}>Increment</Button>
        <Button appearance="outline" onClick={wrap(model.reset)} disabled={model() === 0}>
          Reset
        </Button>
      </div>
    </Panel>
  ),
  'CounterView',
)

export const Counter = reatomFactoryComponent(() => {
  const model = createCounterModel()

  return () => <CounterView model={model} />
}, 'Counter')
