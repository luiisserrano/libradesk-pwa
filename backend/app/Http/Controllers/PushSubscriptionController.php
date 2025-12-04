<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PushSubscriptionController extends Controller
{
    /**
     * Store or update a push subscription.
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|url',
            'keys.p256dh' => 'nullable|string',
            'keys.auth' => 'nullable|string',
        ]);

        $endpoint = $request->endpoint;
        $key = $request->input('keys.p256dh');
        $token = $request->input('keys.auth');
        $encoding = $request->input('encoding');

        $user = Auth::user();

        $subscription = PushSubscription::updateOrCreate(
            ['endpoint' => $endpoint],
            [
                'user_id' => $user ? $user->id : null,
                'public_key' => $key,
                'auth_token' => $token,
                'content_encoding' => $encoding,
            ]
        );

        return response()->json(['message' => 'Subscribed successfully', 'subscription' => $subscription]);
    }

    /**
     * Remove a subscription.
     */
    public function unsubscribe(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|url',
        ]);

        PushSubscription::where('endpoint', $request->endpoint)->delete();

        return response()->json(['message' => 'Unsubscribed successfully']);
    }
}
