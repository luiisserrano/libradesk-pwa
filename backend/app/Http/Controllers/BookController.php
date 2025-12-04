<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    public function index()
    {
        // Trae libros sin archivos pesados
        $books = Book::with(['author', 'genre'])
            ->get()
            ->map(function ($book) {

                return [
                    'id' => $book->id,
                    'title' => $book->title,
                    'author' => $book->author,
                    'genre' => $book->genre,
                    'cover_url' => $book->cover_image
                        ? asset('storage/' . $book->cover_image)
                        : null,
                ];
            });

        return response()->json($books);
    }

    public function show($id)
    {
        $book = Book::with(['author', 'genre'])->find($id);

        if (!$book) {
            return response()->json([
                'message' => 'Book not found'
            ], 404);
        }

        return response()->json([
            'id' => $book->id,
            'title' => $book->title,
            'author' => $book->author,
            'genre' => $book->genre,
            'cover_url' => $book->cover_image
                ? asset('storage/' . $book->cover_image)
                : null,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'author_id' => 'required|exists:authors,id',
            'genre_id' => 'required|exists:genres,id',
            'cover_image' => 'nullable|image|max:2048',
            'pdf_file' => 'nullable|mimes:pdf|max:100000',
        ]);

        try {
            $book = DB::transaction(function () use ($request) {

                $data = [
                    'title' => $request->title,
                    'author_id' => $request->author_id,
                    'genre_id' => $request->genre_id,
                ];

                // Guardar portada
                if ($request->hasFile('cover_image')) {
                    $data['cover_image'] = $request
                        ->file('cover_image')
                        ->store('covers', 'public');
                }

                // Guardar PDF
                if ($request->hasFile('pdf_file')) {
                    $data['pdf_file'] = $request
                        ->file('pdf_file')
                        ->store('pdfs', 'public');
                }

                return Book::create($data);
            });

            $bookData = [
                'id' => $book->id,
                'title' => $book->title,
                'author_id' => $book->author_id,
                'genre_id' => $book->genre_id,
                'cover_url' => $book->cover_image
                    ? asset('storage/' . $book->cover_image)
                    : null
            ];

            // Send Push Notification
            try {
                $pushService = new \App\Services\WebPushService();
                $pushService->sendNotificationToAll(
                    'Nuevo Libro Disponible',
                    "Se ha añadido '{$book->title}' a la biblioteca.",
                    '/', // Open home page
                    $bookData['cover_url']
                );
            } catch (\Exception $e) {
                \Log::error('Push notification error: ' . $e->getMessage());
                // Don't fail the request if notification fails
            }

            return response()->json([
                'message' => 'Book created successfully',
                'book' => $bookData
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Book create error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating book',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Devolver el PDF por ID para verlo en el navegador
    public function getPdf($id)
    {
        $book = Book::find($id);

        if (!$book || !$book->pdf_file) {
            return response()->json([
                'message' => 'PDF not found'
            ], 404);
        }

        $path = storage_path('app/public/' . $book->pdf_file);

        if (!file_exists($path)) {
            return response()->json([
                'message' => 'PDF file missing from storage'
            ], 404);
        }

        return response()->file($path, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $book->title . '.pdf"'
        ]);
    }

    public function getCover($id)
    {
        $book = Book::find($id);

        if (!$book || !$book->cover_image) {
            return response("Image not found", 404);
        }

        $path = storage_path('app/public/' . $book->cover_image);

        if (!file_exists($path)) {
            return response("Image file missing", 404);
        }

        return response()->file($path);
    }

    public function download($id)
    {
        $book = Book::find($id);

        if (!$book || !$book->pdf_file) {
            return response()->json([
                'message' => 'PDF not found'
            ], 404);
        }

        $path = storage_path('app/public/' . $book->pdf_file);

        if (!file_exists($path)) {
            return response()->json([
                'message' => 'PDF file missing from storage'
            ], 404);
        }

        return response()->download($path, $book->title . '.pdf');
    }
    public function update(Request $request, $id)
    {
        $book = Book::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string',
            'author_id' => 'sometimes|required|exists:authors,id',
            'genre_id' => 'sometimes|required|exists:genres,id',
            'cover_image' => 'nullable|image|max:2048',
            'pdf_file' => 'nullable|mimes:pdf|max:100000',
        ]);

        try {
            DB::transaction(function () use ($request, $book) {
                $data = $request->only(['title', 'author_id', 'genre_id']);

                if ($request->hasFile('cover_image')) {
                    // Delete old cover
                    if ($book->cover_image) {
                        Storage::disk('public')->delete($book->cover_image);
                    }
                    $data['cover_image'] = $request->file('cover_image')->store('covers', 'public');
                }

                if ($request->hasFile('pdf_file')) {
                    // Delete old PDF
                    if ($book->pdf_file) {
                        Storage::disk('public')->delete($book->pdf_file);
                    }
                    $data['pdf_file'] = $request->file('pdf_file')->store('pdfs', 'public');
                }

                $book->update($data);
            });

            return response()->json(['message' => 'Book updated successfully', 'book' => $book]);

        } catch (\Exception $e) {
            \Log::error('Book update error: ' . $e->getMessage());
            return response()->json(['message' => 'Error updating book', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $book = Book::findOrFail($id);

        try {
            if ($book->cover_image) {
                Storage::disk('public')->delete($book->cover_image);
            }
            if ($book->pdf_file) {
                Storage::disk('public')->delete($book->pdf_file);
            }

            $book->delete();
            return response()->json(['message' => 'Book deleted successfully']);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting book', 'error' => $e->getMessage()], 500);
        }
    }
}
