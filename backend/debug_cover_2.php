<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$id = 2; // Check book ID 2
$book = App\Models\Book::find($id);

if (!$book) {
    echo "Book $id not found\n";
    exit;
}

echo "Book ID: " . $book->id . "\n";
$cover = $book->cover_image;

if (is_resource($cover)) {
    $cover = stream_get_contents($cover);
}

echo "Cover Length: " . strlen($cover) . "\n";
echo "First 50 chars: " . substr($cover, 0, 50) . "\n";
