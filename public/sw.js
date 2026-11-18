self.addEventListener("push", function (event) {
  if (!event.data) {
    console.log("Push event has no data.");
    return;
  }

  let data = {};
  try {
    data = event.data.json();
  } catch {
    console.error("Push event data is not JSON:", event.data.text());
    data = {
      title: "Thông báo mới",
      body: event.data.text(),
      url: "/",
    };
  }

  const title = data.title || "Thông báo mới từ KTCN";
  const options = {
    body: data.body || "",
    icon: data.icon || "/images/logo-192.png",
    badge: "/images/logo-32.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

function resolveSafeNotificationUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl || "/", self.location.origin);
    if (parsed.origin === self.location.origin) {
      return parsed.pathname + parsed.search + parsed.hash;
    }
  } catch {
    // ignore malformed URL
  }
  return "/";
}

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const targetUrl = resolveSafeNotificationUrl(event.notification.data?.url);

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          if ("navigate" in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }),
  );
});
