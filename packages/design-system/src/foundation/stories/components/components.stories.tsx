import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack, Toolbar, Wrap } from '@einbuergerungstest/design-system/jsx'

import { Button } from '../../../components/button/button'
import { ChoiceGroup } from '../../../components/choice-group/choice-group'
import { InlineNotice } from '../../../components/inline-notice/inline-notice'
import { Panel } from '../../../components/panel/panel'
import { ProgressBar } from '../../../components/progress-bar/progress-bar'
import { StatusBadge } from '../../../components/status-badge/status-badge'
import { TextInput } from '../../../components/text-input/text-input'
import { studyStyles } from './components.stories.styles'

const ComponentExamples = () => (
  <Panel aria-label="Project settings">
    <TextInput
      label="Project name"
      description="Choose a name for your next idea."
      defaultValue="My next app"
    />
    <Button>Save project</Button>
  </Panel>
)

const meta = { title: 'Foundation/Components', component: ComponentExamples } satisfies Meta<
  typeof ComponentExamples
>

export default meta

type Story = StoryObj<typeof meta>

export const Composition = {} satisfies Story

const StudyQuestionExamples = () => (
  <Stack as="section" maxWidth="content" aria-label="Study question example">
    <Wrap align="center">
      <StatusBadge>Question 1 of 310</StatusBadge>
      <StatusBadge intent="danger">Latest answer: incorrect</StatusBadge>
    </Wrap>
    <h2 className={studyStyles.heading}>
      In Deutschland dürfen Menschen offen etwas gegen die Regierung sagen, weil …
    </h2>
    <p className={studyStyles.translation}>
      In Germany, people can openly say something against the government because …
    </p>
    <ChoiceGroup
      label="Choose an answer"
      defaultValue="a"
      options={[
        { value: 'a', marker: 'A', label: 'hier Religionsfreiheit gilt.', result: 'incorrect' },
        { value: 'b', marker: 'B', label: 'hier Menschen Steuern zahlen müssen.' },
        { value: 'c', marker: 'C', label: 'hier Menschen wählen dürfen.' },
        { value: 'd', marker: 'D', label: 'hier Meinungsfreiheit gilt.', result: 'correct' },
      ]}
    />
    <InlineNotice intent="danger" title="Not quite">
      Your latest answer was saved. Try again to update this question’s status.
    </InlineNotice>
    <ProgressBar aria-label="Questions solved" value={4} />
    <Toolbar placeContent="normal space-between">
      <Button appearance="outline">Previous question</Button>
      <Button>Next question</Button>
    </Toolbar>
  </Stack>
)

export const StudyQuestion = { render: () => <StudyQuestionExamples /> } satisfies Story
