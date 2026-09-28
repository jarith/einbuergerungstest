import type { PageProps } from '../../../../app/routing'
import type { QuestionHistoryData } from '../../question-history.route'

export const QuestionHistoryPage = ({ data }: PageProps<QuestionHistoryData>) => (
  <div data-question-key={data.selected.key}>Question history</div>
)
