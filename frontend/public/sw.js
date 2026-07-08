self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.text()
    
    // We can also parse JSON if we send JSON
    let title = 'CareFlow AI Alarm'
    let options = {
      body: data,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      requireInteraction: true,
      actions: [
        { action: 'take_meds', title: 'Mark as Taken' },
        { action: 'snooze', title: 'Snooze' }
      ]
    }

    try {
      const jsonData = JSON.parse(data)
      if (jsonData.title) title = jsonData.title
      if (jsonData.options) options = { ...options, ...jsonData.options }
    } catch (e) {
      // It's just text
    }

    event.waitUntil(self.registration.showNotification(title, options))
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  if (event.action === 'take_meds') {
    console.log('Medication taken')
    // Could send API request here
  } else if (event.action === 'snooze') {
    console.log('Snoozed alarm')
    // Could trigger another alarm in 10 mins
  } else {
    // Just click on the notification body, open app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((windowClients) => {
        if (windowClients.length > 0) {
          windowClients[0].focus()
        } else {
          clients.openWindow('/medications')
        }
      })
    )
  }
})
