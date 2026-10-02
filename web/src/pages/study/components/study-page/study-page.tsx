import type { PageProps } from '../../../../app/routing'
import type { StudyData } from '../../study.route'
import { StudySession } from './components/study-session/study-session'

export const StudyPage = ({ data }: PageProps<StudyData>) => <StudySession model={data.model} />
