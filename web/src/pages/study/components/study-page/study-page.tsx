import type { PageProps } from '../../../../app/routing'
import type { StudyData } from '../../study.route'

export const StudyPage = ({ data }: PageProps<StudyData>) => (
  <div data-question-key={data.selected.key} data-group-id={data.group?.id}>
    Study
  </div>
)
