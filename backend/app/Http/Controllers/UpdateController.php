<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UpdateController extends Controller
{
    /**
     * Return the last update timestamp for the app (books/important changes)
     */
    public function latest(Request $request)
    {
        $last = \Illuminate\Support\Facades\Cache::get('app_last_update');

        if (!$last) {
            // Fallback: return current time if not set
            $last = now()->toDateTimeString();
            \Illuminate\Support\Facades\Cache::put('app_last_update', $last);
        }

        return response()->json([
            'last_update' => $last
        ]);
    }
}
