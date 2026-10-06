import { enterAppMode } from './app/offline/app-mode'

window.matchMedia('(display-mode: standalone)').addEventListener('change', enterAppMode)

if (enterAppMode()) {
  void import('./main')
}
