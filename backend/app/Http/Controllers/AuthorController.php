<?php

namespace App\Http\Controllers;

use App\Models\Author;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    public function index()
    {
        return response()->json(Author::all());
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:authors,name']);
        $author = Author::create($request->all());
        return response()->json($author, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|unique:authors,name,' . $id]);
        $author = Author::findOrFail($id);
        $author->update($request->all());
        return response()->json($author);
    }

    public function destroy($id)
    {
        Author::findOrFail($id)->delete();
        return response()->json(['message' => 'Author deleted successfully']);
    }
}
