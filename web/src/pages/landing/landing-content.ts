import de from '../../app/i18n/de.json'
import en from '../../app/i18n/en.json'

export const getLandingContent = (language: 'de' | 'en') => {
  const content = {
    de: {
      title: 'Einbürgerungstest Berlin – 310 Fragen online üben',
      description:
        'Übe alle 310 Fragen für Berlin: 300 allgemeine und 10 Berlin-Fragen, englische Übersetzungen, Probetests und Offline-Lernen. Fortschritt bleibt auf deinem Gerät.',
      heading: 'Einbürgerungstest Berlin',
      lead: '310 Fragen. In deinem Tempo.',
      intro:
        'Bereite dich mit allen 300 allgemeinen Fragen und den 10 Fragen für Berlin vor. Übe einzelne Fragen, lerne nach Themen oder starte einen Probetest.',
      dashboard: 'Zur Lernübersicht',
      skip: 'Zum Inhalt',
      navigation: 'Sprache',
      features: [
        {
          title: 'Probetests mit Zeitlimit',
          text: 'Übe mit 33 Fragen: 30 allgemeinen und 3 Berlin-Fragen. Du hast 60 Minuten Zeit und kannst deine Antworten bis zum Abschluss ändern. Danach siehst du dein Ergebnis und kannst die Antworten durchgehen.',
        },
        {
          title: 'Auch ohne Internet üben',
          text: 'Öffne das Training zunächst mit Internetverbindung und warte auf „Offline bereit“. Danach sind Fragen, Bilder und Übersetzungen auch ohne Netz verfügbar. Wenn der Browser gespeicherte Dateien entfernt, verbinde dich erneut und bereite die App wieder offline vor.',
        },
        {
          title: 'Dein Fortschritt bleibt bei dir',
          text: 'Kein Konto nötig: Dein Lernfortschritt wird lokal in diesem Browser gespeichert und nicht automatisch mit anderen Geräten synchronisiert. Lade in den Einstellungen regelmäßig eine Sicherung herunter. Auf iPhone und iPad kann die installierte App einen eigenen Speicher haben; übertrage deinen Fortschritt mit Export und Import.',
        },
      ],
      installation: {
        title: 'Auf dem Gerät installieren',
        platforms: [
          { title: de.installation.iosTitle, text: de.installation.iosHelp },
          { title: de.installation.androidTitle, text: de.installation.androidHelp },
        ],
      },
      source: 'Offizielle Informationen zum Einbürgerungstest beim BAMF',
    },
    en: {
      title: 'Berlin citizenship test – practise all 310 questions',
      description:
        'Prepare for the Berlin citizenship test with 310 questions, English translations, timed mock tests and offline study. Your progress stays on your device.',
      heading: 'Berlin citizenship test',
      lead: '310 questions. At your own pace.',
      intro:
        'Prepare with all 300 general questions and the 10 questions specific to Berlin. Practise individual questions, study by topic or take a mock test.',
      dashboard: 'Open dashboard',
      skip: 'Skip to content',
      navigation: 'Language',
      features: [
        {
          title: 'Practise with timed mock tests',
          text: 'Each mock test has 33 questions: 30 general questions and 3 Berlin questions. You have 60 minutes and can change answers until you finish. Afterwards, see your result and review your answers.',
        },
        {
          title: 'Keep studying offline',
          text: 'First open the training with an internet connection and wait for “Ready offline”. Questions, images and translations are then available without a connection. If your browser removes saved files, reconnect and prepare the app for offline use again.',
        },
        {
          title: 'Your progress stays with you',
          text: 'No account needed: your progress is saved locally in this browser and does not automatically sync between devices. Download a backup regularly in Settings. On iPhone and iPad, the installed app can have separate storage; transfer your progress using export and import.',
        },
      ],
      installation: {
        title: 'Install on your device',
        platforms: [
          { title: en.installation.iosTitle, text: en.installation.iosHelp },
          { title: en.installation.androidTitle, text: en.installation.androidHelp },
        ],
      },
      source: 'Official BAMF information about the citizenship test',
    },
  }

  return content[language]
}
