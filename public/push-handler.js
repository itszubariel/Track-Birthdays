self.addEventListener('push', (event) => {
  console.log('Push received on mobile')
  
  const promise = (async () => {
    let title = 'Track Birthdays'
    let body = 'You have a birthday coming up!'
    
    if (event.data) {
      try {
        const data = event.data.json()
        if (data.title) title = data.title
        if (data.body) body = data.body
      } catch (e) {
        body = event.data.text()
      }
    }

    await self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'birthday-notification',
      renotify: true
    })
  })()

  event.waitUntil(promise)
})