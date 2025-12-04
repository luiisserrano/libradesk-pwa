<?php

namespace App\Services;

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use App\Models\PushSubscription;

class WebPushService
{
    protected $webPush;

    public function __construct()
    {
        $auth = [
            'VAPID' => [
                'subject' => 'mailto:admin@libradesk.com', // Customize this
                'publicKey' => env('VAPID_PUBLIC_KEY'),
                'privateKey' => env('VAPID_PRIVATE_KEY'),
            ],
        ];

        $this->webPush = new WebPush($auth);
    }

    public function sendNotificationToAll($title, $body, $url = '/', $image = null)
    {
        $subscriptions = PushSubscription::all();

        foreach ($subscriptions as $sub) {
            $subscription = Subscription::create([
                'endpoint' => $sub->endpoint,
                'publicKey' => $sub->public_key,
                'authToken' => $sub->auth_token,
                'contentEncoding' => $sub->content_encoding,
            ]);

            $payload = json_encode([
                'title' => $title,
                'body' => $body,
                'icon' => '/assets/icon/icon.png',
                'image' => $image,
                'data' => [
                    'url' => $url
                ]
            ]);

            $this->webPush->queueNotification($subscription, $payload);
        }

        foreach ($this->webPush->flush() as $report) {
            $endpoint = $report->getRequest()->getUri()->__toString();

            if ($report->isSuccess()) {
                // echo "[v] Message sent successfully for subscription {$endpoint}.";
            } else {
                // echo "[x] Message failed to sent for subscription {$endpoint}: {$report->getReason()}";

                // If the subscription is expired, delete it
                if ($report->isSubscriptionExpired()) {
                    PushSubscription::where('endpoint', $endpoint)->delete();
                }
            }
        }
    }
}
