<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\UserLibraryController;

// --------------------------
//  AUTH (PUBLICO)
// --------------------------
Route::get('/debug-cors', function () {
    return [
        'config' => config('cors'),
        'middleware' => request()->route()->gatherMiddleware(),
    ];
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --------------------------
//  BOOKS (PUBLICO)
// --------------------------
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{id}', [BookController::class, 'show']);
Route::get('/books/{id}/pdf', [BookController::class, 'getPdf']);
Route::get('/books/{id}/cover', [BookController::class, 'getCover']);
Route::get('/books/{id}/download', [BookController::class, 'download']);

// --------------------------
//  AUTORES Y GENEROS (PUBLICO)
// --------------------------
Route::get('/authors', function () {
    return App\Models\Author::all();
});

Route::get('/genres', function () {
    return App\Models\Genre::all();
});

// --------------------------
//  RUTAS PROTEGIDAS
// --------------------------
Route::middleware('auth:sanctum')->group(function () {

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Obtener usuario actual
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Actualizar perfil
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);

    // Foto de usuario
    Route::get('/users/{id}/photo', [AuthController::class, 'getProfilePhoto']);

    // Biblioteca personal
    Route::get('/library', [UserLibraryController::class, 'index']);
    Route::post('/library', [UserLibraryController::class, 'addToLibrary']);
    Route::put('/library/{bookId}', [UserLibraryController::class, 'updateProgress']);
    Route::delete('/library/{bookId}', [UserLibraryController::class, 'removeFromLibrary']);

    // Push Notifications
    Route::post('/push/subscribe', [\App\Http\Controllers\PushSubscriptionController::class, 'subscribe']);
    Route::post('/push/unsubscribe', [\App\Http\Controllers\PushSubscriptionController::class, 'unsubscribe']);
    Route::post('/push/test', function () {
        $pushService = new \App\Services\WebPushService();
        $pushService->sendNotificationToAll(
            'Test Notification',
            'This is a test notification from Libradesk.',
            '/',
            null
        );
        return response()->json(['message' => 'Test notification sent']);
    });

    // --------------------------
    //  ADMIN ROUTES
    // --------------------------
    // TODO: Add middleware to check for role_id = 1
    Route::prefix('admin')->group(function () {

        // Users
        Route::get('/users', [\App\Http\Controllers\AdminController::class, 'index']);
        Route::put('/users/{id}', [\App\Http\Controllers\AdminController::class, 'updateRole']);
        Route::delete('/users/{id}', [\App\Http\Controllers\AdminController::class, 'destroy']);

        // Books
        Route::post('/books', [BookController::class, 'store']); // Create book
        Route::put('/books/{id}', [BookController::class, 'update']);
        Route::delete('/books/{id}', [BookController::class, 'destroy']);

        // Genres
        Route::get('/genres', [\App\Http\Controllers\GenreController::class, 'index']);
        Route::post('/genres', [\App\Http\Controllers\GenreController::class, 'store']);
        Route::put('/genres/{id}', [\App\Http\Controllers\GenreController::class, 'update']);
        Route::delete('/genres/{id}', [\App\Http\Controllers\GenreController::class, 'destroy']);

        // Authors
        Route::get('/authors', [\App\Http\Controllers\AuthorController::class, 'index']);
        Route::post('/authors', [\App\Http\Controllers\AuthorController::class, 'store']);
        Route::put('/authors/{id}', [\App\Http\Controllers\AuthorController::class, 'update']);
        Route::delete('/authors/{id}', [\App\Http\Controllers\AuthorController::class, 'destroy']);
    });

});
