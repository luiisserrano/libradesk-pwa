<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Genre;

class GenreSeeder extends Seeder
{
    public function run(): void
    {
        $genres = [
            ['name' => 'Ficción'],
            ['name' => 'No Ficción'],
            ['name' => 'Novela'],
            ['name' => 'Cuento'],
            ['name' => 'Poesía'],
            ['name' => 'Drama'],
            ['name' => 'Ensayo'],
            ['name' => 'Biografía'],
            ['name' => 'Historia'],
            ['name' => 'Ciencia'],
            ['name' => 'Tecnología'],
            ['name' => 'Filosofía'],
            ['name' => 'Psicología'],
            ['name' => 'Autoayuda'],
            ['name' => 'Romance'],
            ['name' => 'Misterio'],
            ['name' => 'Thriller'],
            ['name' => 'Ciencia Ficción'],
            ['name' => 'Fantasía'],
            ['name' => 'Terror'],
            ['name' => 'Aventura'],
            ['name' => 'Humor'],
            ['name' => 'Infantil'],
            ['name' => 'Juvenil'],
            ['name' => 'Cómic'],
        ];

        foreach ($genres as $genre) {
            Genre::firstOrCreate(['name' => $genre['name']], $genre);
        }
    }
}
