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
      start: 'Jetzt üben',
      dashboard: 'Mein Lernfortschritt',
      skip: 'Zum Inhalt',
      navigation: 'Sprache und Training',
      features: [
        {
          title: 'Für Berlin lernen',
          text: 'Der Fragenkatalog enthält 310 Fragen: 300 allgemeine Fragen zu Demokratie, Geschichte und Gesellschaft sowie 10 landesspezifische Fragen für Berlin. Übe mit direkter Rückmeldung und wiederhole Fragen nach deinem Lernstand.',
        },
        {
          title: 'Mit englischen Übersetzungen',
          text: 'Beim Lernen kannst du englische Übersetzungen neben den deutschen Fragen und Antworten einblenden. Die Oberfläche ist auf Deutsch und Englisch verfügbar. Im Probetest bleiben die Fragen auf Deutsch.',
        },
        {
          title: 'Probetests mit Zeitlimit',
          text: 'Übe mit 33 Fragen: 30 allgemeinen und 3 Berlin-Fragen. Du hast 60 Minuten Zeit und kannst deine Antworten bis zum Abschluss ändern. Danach siehst du dein Ergebnis und kannst die Antworten durchgehen.',
        },
        {
          title: 'Auch ohne Internet üben',
          text: 'Öffne das Training zunächst mit Internetverbindung und warte auf „Offline bereit“. Danach sind Fragen, Bilder und Übersetzungen auch ohne Netz verfügbar. Wenn der Browser gespeicherte Dateien entfernt, verbinde dich erneut und bereite die App wieder offline vor.',
        },
        {
          title: 'Auf dem Gerät installieren',
          text: 'Auf iPhone oder iPad öffnest du die Seite in Safari und wählst im Teilen-Menü „Zum Home-Bildschirm“. Unterstützte Android- und Desktop-Browser bieten die Installation im Browser-Menü an. Eine Installation ist zum Lernen nicht erforderlich.',
        },
        {
          title: 'Dein Fortschritt bleibt bei dir',
          text: 'Kein Konto nötig: Dein Lernfortschritt wird lokal in diesem Browser gespeichert und nicht automatisch mit anderen Geräten synchronisiert. Lade in den Einstellungen regelmäßig eine Sicherung herunter. Auf iPhone und iPad kann die installierte App einen eigenen Speicher haben; übertrage deinen Fortschritt mit Export und Import.',
        },
      ],
      closing: 'Bereit für die erste Frage?',
      closingText: 'Starte direkt oder öffne deine persönliche Lernübersicht.',
      footer: 'Unabhängiges Lernangebot. Keine offizielle Website des BAMF.',
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
      start: 'Start practising',
      dashboard: 'My study progress',
      skip: 'Skip to content',
      navigation: 'Language and training',
      features: [
        {
          title: 'Study for Berlin',
          text: 'The question bank contains 310 questions: 300 general questions about democracy, history and society, plus 10 state-specific questions for Berlin. Get immediate feedback during study and revisit questions based on your learning progress.',
        },
        {
          title: 'Learn with English translations',
          text: 'During study, you can show English translations alongside the original German questions and answers. The interface is available in German and English. Mock-test questions stay in German.',
        },
        {
          title: 'Practise with timed mock tests',
          text: 'Each mock test has 33 questions: 30 general questions and 3 Berlin questions. You have 60 minutes and can change answers until you finish. Afterwards, see your result and review your answers.',
        },
        {
          title: 'Keep studying offline',
          text: 'First open the training with an internet connection and wait for “Ready offline”. Questions, images and translations are then available without a connection. If your browser removes saved files, reconnect and prepare the app for offline use again.',
        },
        {
          title: 'Install on your device',
          text: 'On iPhone or iPad, open the site in Safari and choose “Add to Home Screen” from the Share menu. Supported Android and desktop browsers offer installation in their browser menu. You can also study without installing the app.',
        },
        {
          title: 'Your progress stays with you',
          text: 'No account needed: your progress is saved locally in this browser and does not automatically sync between devices. Download a backup regularly in Settings. On iPhone and iPad, the installed app can have separate storage; transfer your progress using export and import.',
        },
      ],
      closing: 'Ready for your first question?',
      closingText: 'Start practising or open your personal study overview.',
      footer: 'Independent study tool. Not an official BAMF website.',
      source: 'Official BAMF information about the citizenship test',
    },
  }

  return content[language]
}
