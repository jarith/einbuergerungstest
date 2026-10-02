import { Grid, Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { PageProps } from '../../../../app/routing'
import type { StudyGroupsData, StudyGroupsModel } from '../../study-groups.model'
import { GroupRow } from './components/group-row/group-row'
import { GroupsIntro } from './components/groups-intro/groups-intro'
import { styles } from './study-groups-page.styles'

export type StudyGroupsSectionProps = Readonly<{ model: StudyGroupsModel }>

export const StudyGroupsPage = reatomComponent(({ data }: PageProps<StudyGroupsData>) => {
  const model = data.groups
  const t = model.localization.t()

  return (
    <Stack gap="24" css={{ ...styles.root }}>
      <GroupsIntro model={model} />
      <Grid as="ol" css={{ ...styles.groups }}>
        {model().map((group) => (
          <GroupRow key={group.id} group={group} t={t} />
        ))}
      </Grid>
    </Stack>
  )
}, 'StudyGroupsPage')
