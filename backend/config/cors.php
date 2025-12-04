<?php

return [

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
        'user',
    ],

    'allowed_methods' => ['*'],

    // SOLO se permiten estos orígenes
    'allowed_origins' => [
        'https://adc99ef3c87e.ngrok-free.app', // Frontend React PWA
        'http://localhost:5173',              // Desarrollo local
    ],

    'allowed_origins_patterns' => [],

    // Necesario porque usas withCredentials y tokens
    'supports_credentials' => true,

    'allowed_headers' => ['*'],

    'exposed_headers' => [
        'Authorization',
        'Content-Type',
    ],

    'max_age' => 0,
];
