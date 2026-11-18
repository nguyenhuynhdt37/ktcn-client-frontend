"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { useLocale } from "next-intl";
import { axiosClient } from "@/shared/api/axios-client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const locale = useLocale();
  const isEn = locale === "en";
  const [showBanner, setShowBanner] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const updateSubscription = useCallback(async (registration: ServiceWorkerRegistration) => {
    try {
      // 1. Lấy VAPID public key từ backend
      const res = await axiosClient.get("/api/v1/portal/notifications/vapid-public-key");
      const vapidPublicKey = res.data.public_key;

      if (!vapidPublicKey) {
        console.warn("VAPID public key is empty");
        return;
      }

      // 2. Trình duyệt kiểm tra và subscribe nhận thông báo đẩy
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      const existingSubscription = await registration.pushManager.getSubscription();
      let subscription = existingSubscription;

      if (existingSubscription) {
        const existingKey = existingSubscription.options.applicationServerKey;
        if (existingKey) {
          const existingKeyArray = new Uint8Array(existingKey);
          let keyMatches = existingKeyArray.length === convertedVapidKey.length;
          if (keyMatches) {
            for (let i = 0; i < convertedVapidKey.length; i++) {
              if (existingKeyArray[i] !== convertedVapidKey[i]) {
                keyMatches = false;
                break;
              }
            }
          }
          if (!keyMatches) {
            console.log("🔔 Web Push: VAPID Key changed, unsubscribing existing subscription...");
            await existingSubscription.unsubscribe();
            subscription = null;
          }
        } else {
          await existingSubscription.unsubscribe();
          subscription = null;
        }
      }

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      // 3. Trích xuất keys dưới dạng base64 URL safe
      const p256dh = subscription.getKey("p256dh")
        ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!)))
        : "";
      const auth = subscription.getKey("auth")
        ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!)))
        : "";

      const payload = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh,
          auth,
        },
        user_agent: navigator.userAgent,
      };

      // 4. Gửi subscription lên Backend lưu trữ
      await axiosClient.post("/api/v1/portal/notifications/subscribe", payload);
      console.log(
        "%c🔔 Web Push %c Device subscription successfully synchronized with Backend! ",
        "background: #10b981; color: white; padding: 3px 6px; border-radius: 4px 0 0 4px; font-weight: bold; font-family: system-ui, sans-serif;",
        "background: #d1fae5; color: #065f46; padding: 3px 6px; border-radius: 0 4px 4px 0; font-family: system-ui, sans-serif; font-weight: 500;",
      );
    } catch (error) {
      console.error("Failed to update push subscription:", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | undefined;

    // Đăng ký Service Worker
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        if (cancelled) return;
        console.log(
          "%c🔔 Web Push %c Service Worker registered successfully! Scope: " + reg.scope,
          "background: #3b82f6; color: white; padding: 3px 6px; border-radius: 4px 0 0 4px; font-weight: bold; font-family: system-ui, sans-serif;",
          "background: #dbeafe; color: #1e3a8a; padding: 3px 6px; border-radius: 0 4px 4px 0; font-family: system-ui, sans-serif;",
        );

        if (Notification.permission === "granted") {
          void updateSubscription(reg);
        } else if (Notification.permission === "default") {
          const dismissed = localStorage.getItem("push-notification-dismissed");
          if (!dismissed) {
            timerId = setTimeout(() => {
              if (!cancelled) setShowBanner(true);
            }, 3000);
          }
        }
      })
      .catch((err) => {
        console.error("Service Worker registration failed:", err);
      });

    return () => {
      cancelled = true;
      if (timerId !== undefined) clearTimeout(timerId);
    };
  }, [updateSubscription]);

  const handleSubscribe = async () => {
    if (!("serviceWorker" in navigator)) return;

    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        await updateSubscription(registration);
        setShowBanner(false);
      } else {
        console.warn("Notification permission denied");
        localStorage.setItem("push-notification-dismissed", "true");
        setShowBanner(false);
      }
    } catch (err) {
      console.error("Error subscribing to push notifications:", err);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("push-notification-dismissed", "true");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      role="region"
      aria-label={isEn ? "Push notifications" : "Thông báo đẩy"}
      className="border-border bg-card/95 animate-in fade-in slide-in-from-top-5 fixed top-24 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-xl border p-3.5 shadow-lg backdrop-blur-md transition-all duration-300 sm:w-80 md:right-6"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <Bell className="h-4 w-4 animate-bounce" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-foreground truncate text-xs font-semibold">
            {isEn ? "Enable push notifications?" : "Nhận thông báo đẩy?"}
          </h3>
          <p className="text-muted-foreground truncate text-[11px]">
            {isEn ? "Get latest updates from the university" : "Cập nhật tin tức quan trọng từ nhà trường"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={isSubscribing}
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-9 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {isSubscribing ? "..." : isEn ? "Allow" : "Đồng ý"}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-9 items-center justify-center rounded-full transition-colors"
            aria-label={isEn ? "Dismiss" : "Bỏ qua"}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
