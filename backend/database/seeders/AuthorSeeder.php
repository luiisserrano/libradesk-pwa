<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Author;

class AuthorSeeder extends Seeder
{
    public function run(): void
    {
        $authors = [
            ['name' => 'Gabriel García Márquez'],
            ['name' => 'Isabel Allende'],
            ['name' => 'Jorge Luis Borges'],
            ['name' => 'Julio Cortázar'],
            ['name' => 'Mario Vargas Llosa'],
            ['name' => 'Pablo Neruda'],
            ['name' => 'Octavio Paz'],
            ['name' => 'Carlos Fuentes'],
            ['name' => 'Laura Esquivel'],
            ['name' => 'Juan Rulfo'],
            ['name' => 'Miguel de Cervantes'],
            ['name' => 'Federico García Lorca'],
            ['name' => 'Sor Juana Inés de la Cruz'],
            ['name' => 'Rubén Darío'],
            ['name' => 'Horacio Quiroga'],
            ['name' => 'Ernesto Sabato'],
            ['name' => 'Alejo Carpentier'],
            ['name' => 'José Martí'],
            ['name' => 'Rosario Castellanos'],
            ['name' => 'Elena Poniatowska'],
        ];

        foreach ($authors as $author) {
            Author::firstOrCreate(['name' => $author['name']], $author);
        }
    }
}
