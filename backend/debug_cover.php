<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$id = 3; // Book ID from screenshot
$book = App\Models\Book::find($id);

if (!$book) {
    echo "Book $id not found\n";
    exit;
}

echo "Book ID: " . $book->id . "\n";
echo "Cover Type: " . gettype($book->cover_image) . "\n";

$cover = $book->cover_image;

if (is_resource($cover)) {
    echo "Cover is a resource. Reading content...\n";
    $cover = stream_get_contents($cover);
}

echo "Cover Length: " . strlen($cover) . "\n";
echo "First 50 chars: " . substr($cover, 0, 50) . "\n";
echo "Hex dump (first 50): " . bin2hex(substr($cover, 0, 50)) . "\n";

// Check for common headers
if (strpos($cover, 'PNG') !== false)
    echo "Contains PNG header\n";
if (strpos($cover, 'JFIF') !== false)
    echo "Contains JFIF header\n";
if (substr($cover, 0, 2) === '\x')
    echo "Starts with \\x\n";
