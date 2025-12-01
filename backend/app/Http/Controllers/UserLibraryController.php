<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserBook;
use App\Models\Book;

class UserLibraryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $books = $user->books()->with(['author', 'genre'])->get();

        $library = $books->map(function ($book) {
            return [
                'id' => $book->id,
                'title' => $book->title,
                'author' => $book->author,
                'genre' => $book->genre,
                'cover_url' => $book->cover_image
                    ? asset('storage/' . $book->cover_image)
                    : null,
                'current_page' => $book->pivot->current_page ?? 0,
            ];
        });

        return response()->json($library);
    }

    public function addToLibrary(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
        ]);

        $user = $request->user();

        if ($user->books()->where('book_id', $request->book_id)->exists()) {
            return response()->json(['message' => 'Book already in library'], 409);
        }

        $user->books()->attach($request->book_id, ['current_page' => 0]);

        return response()->json(['message' => 'Book added to library']);
    }

    public function updateProgress(Request $request, $bookId)
    {
        $request->validate([
            'current_page' => 'required|integer|min:0',
        ]);

        $user = $request->user();
        $user->books()->updateExistingPivot($bookId, ['current_page' => $request->current_page]);

        return response()->json(['message' => 'Progress updated']);
    }

    public function removeFromLibrary(Request $request, $bookId)
    {
        $user = $request->user();
        $user->books()->detach($bookId);

        return response()->json(['message' => 'Book removed from library']);
    }
}
