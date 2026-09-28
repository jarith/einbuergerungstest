import type { PageProps } from '../../../../app/routing'

export const QuestionListPage = ({ data }: PageProps) => (
  <div data-question-count={data.questions.bank.question_count}>Question list</div>
)
