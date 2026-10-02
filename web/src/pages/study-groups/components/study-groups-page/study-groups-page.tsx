import type { PageProps } from '../../../../app/routing'

export const StudyGroupsPage = ({ data }: PageProps) => (
  <div data-question-count={data.questions.bank.question_count}>Study groups</div>
)
