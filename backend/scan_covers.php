<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$books = App\Models\Book::whereNotNull('cover_image')->get();

echo "Found " . $books->count() . " books with covers.\n";

foreach ($books as $book) {
    $cover = $book->cover_image;
    if (is_resource($cover)) {
        $cover = stream_get_contents($cover);
    }

    $len = strlen($cover);
    $preview = substr($cover, 0, 20);
    $isPath = strpos($preview, 'covers/') === 0;

    echo "ID: {$book->id} | Len: $len | IsPath: " . ($isPath ? 'YES' : 'NO') . " | Preview: " . bin2hex($preview) . "\n";
}
