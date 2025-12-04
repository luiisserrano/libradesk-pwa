<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use Illuminate\Http\Request;

class GenreController extends Controller
{
    public function index()
    {
        return response()->json(Genre::all());
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:genres,name']);
        $genre = Genre::create($request->all());
        return response()->json($genre, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|unique:genres,name,' . $id]);
        $genre = Genre::findOrFail($id);
        $genre->update($request->all());
        return response()->json($genre);
    }

    public function destroy($id)
    {
        Genre::findOrFail($id)->delete();
        return response()->json(['message' => 'Genre deleted successfully']);
    }
}
