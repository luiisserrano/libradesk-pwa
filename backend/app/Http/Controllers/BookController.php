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

            return response()->json([
                'message' => 'Book created successfully',
                'book' => [
                    'id' => $book->id,
                    'title' => $book->title,
                    'author_id' => $book->author_id,
                    'genre_id' => $book->genre_id,
                    'cover_url' => $book->cover_image
                        ? asset('storage/' . $book->cover_image)
                        : null
                ]
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

        $pdfContent = $book->pdf_file;

        // Si es un recurso (PostgreSQL bytea), convertir a string
        if (is_resource($pdfContent)) {
            $pdfContent = stream_get_contents($pdfContent);
        }

        // Si es binario (datos directos), devolverlo
        if (is_string($pdfContent) && strlen($pdfContent) > 255 && strpos($pdfContent, '%PDF') !== false) {
            // Es contenido binario del PDF
            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'inline; filename="' . $book->title . '.pdf"');
        }

        // Si es una ruta de archivo, buscar el archivo
        $pdfPath = storage_path('app/public/' . $pdfContent);

        if (!file_exists($pdfPath)) {
            return response()->json([
                'message' => 'PDF file missing from storage',
                'path' => $pdfContent
            ], 404);
        }

        return response()->file($pdfPath, [
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

        $cover = $book->cover_image;

        // 1. Si es un recurso (stream de BD), obtener contenido
        if (is_resource($cover)) {
            $cover = stream_get_contents($cover);
        }

        // 2. Verificar si es una ruta de archivo existente en el storage
        if (is_string($cover)) {
            // Limpiar posibles caracteres nulos o basura si viene de un campo binario mal interpretado
            $cleanPath = trim($cover);
            $path = storage_path('app/public/' . $cleanPath);

            if (file_exists($path) && is_file($path)) {
                return response()->file($path);
            }
        }

        // 3. Si no es archivo, asumir que es contenido binario (BLOB)
        if (is_string($cover)) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = finfo_buffer($finfo, $cover);
            finfo_close($finfo);

            return response($cover, 200)
                ->header("Content-Type", $mime)
                ->header("Content-Disposition", "inline");
        }

        return response("Invalid image format", 500);
    }

}
