import type { PageProps } from '../../../../app/routing'
import type { StudyData } from '../../study.route'
import { StudySession } from './components/study-session/study-session'

export const StudyPage = ({ data }: PageProps<StudyData>) => {
  if (data.model === null) {
    return (
      <div data-question-key={data.selected.key} data-group-id={data.group?.id}>
        Study
      </div>
    )
  }

  return <StudySession model={data.model} />
}
