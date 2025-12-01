<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);


    // Books
    Route::get('/books', [App\Http\Controllers\BookController::class, 'index']);
    Route::post('/books', [App\Http\Controllers\BookController::class, 'store']);
    Route::get('/books/{id}', [App\Http\Controllers\BookController::class, 'show']);
    Route::get('/books/{id}/pdf', [App\Http\Controllers\BookController::class, 'getPdf']);
    Route::get('/books/{id}/cover', [App\Http\Controllers\BookController::class, 'getCover']);
    Route::get('/books/{id}/download', [App\Http\Controllers\BookController::class, 'download']);

    // Users
    Route::get('/users/{id}/photo', [App\Http\Controllers\AuthController::class, 'getProfilePhoto']);

    // Authors and Genres
    Route::get('/authors', function () {
        return App\Models\Author::all();
    });
    Route::get('/genres', function () {
        return App\Models\Genre::all();
    });

    // Library
    Route::get('/library', [App\Http\Controllers\UserLibraryController::class, 'index']);
    Route::post('/library', [App\Http\Controllers\UserLibraryController::class, 'addToLibrary']);
    Route::put('/library/{bookId}', [App\Http\Controllers\UserLibraryController::class, 'updateProgress']);
    Route::delete('/library/{bookId}', [App\Http\Controllers\UserLibraryController::class, 'removeFromLibrary']);
});
