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
            'VAPID' => config('services.vapid'),
        ];

        \Illuminate\Support\Facades\Log::info('WebPushService Auth Config:', $auth);

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

        $successCount = 0;
        $failCount = 0;

        foreach ($this->webPush->flush() as $report) {
            $endpoint = $report->getRequest()->getUri()->__toString();

            if ($report->isSuccess()) {
                $successCount++;
                \Illuminate\Support\Facades\Log::info("Push notification sent successfully to: " . substr($endpoint, 0, 50) . "...");
            } else {
                $failCount++;
                \Illuminate\Support\Facades\Log::error("Push notification FAILED for: " . substr($endpoint, 0, 50) . "... Reason: " . $report->getReason());

                // If the subscription is expired, delete it
                if ($report->isSubscriptionExpired()) {
                    \Illuminate\Support\Facades\Log::warning("Subscription expired, deleting: " . substr($endpoint, 0, 50));
                    PushSubscription::where('endpoint', $endpoint)->delete();
                }
            }
        }

        \Illuminate\Support\Facades\Log::info("Push notifications summary: {$successCount} sent, {$failCount} failed");
    }
}
