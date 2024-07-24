import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import React, { useState, FormEvent } from "react";
import { db } from "../db.server"; // Ensure the path is correct

// Loader to fetch todos from the database
export const loader: LoaderFunction = async () => {
  const todos = await db.any('SELECT * FROM todos');
  return json({ todos });
};

// Action to handle add, delete, and update operations
export const action: ActionFunction = async ({ request }) => {
  const formData = new URLSearchParams(await request.text());
  const actionType = formData.get("_action");
  const id = formData.get("id");
  const title = formData.get("title");
  const newTitle = formData.get("newTitle");

  if (actionType === "delete" && id) {
    await db.none('DELETE FROM todos WHERE id = $1', [id]);
  }

  if (actionType === "add" && title) {
    await db.none('INSERT INTO todos (title) VALUES ($1)', [title]);
  }

  if (actionType === "update" && id && newTitle) {
    await db.none('UPDATE todos SET title = $1 WHERE id = $2', [newTitle, id]);
  }

  return redirect("/todos"); // Redirect to the same page to refresh the list
};

export default function Todos() {
  const { todos } = useLoaderData<{ todos: { id: number; title: string }[] }>();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const handleEditClick = (id: number, title: string) => {
    setEditingId(id);
    setNewTitle(title);
  };

  const handleUpdateSubmit = () => {
    setEditingId(null); // Hide edit form after update
    setNewTitle(""); // Clear the new title
  };

  const handleAddSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const titleField = form.elements.namedItem("title") as HTMLInputElement;

    // Optionally check if the title field has a value
    if (titleField.value.trim() !== "") {
      form.submit(); // Submit the form to the server
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">To-Do List</h1>

      {/* Form to Add New To-Do */}
      <Form method="post" onSubmit={handleAddSubmit} className="mb-6 flex items-center space-x-4">
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Enter new to-do..."
          className="flex-grow border rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input type="hidden" name="_action" value="add" />
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition duration-150"
        >
          Add
        </button>
      </Form>

      {/* List of To-Dos */}
      <ul className="list-disc space-y-4">
        {todos.map(todo => (
          <li
            key={todo.id}
            className="flex flex-col p-4 border rounded-lg shadow-sm bg-gray-50"
          >
            <div className="flex items-center justify-between mb-2">
              {editingId === todo.id ? (
                <>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="New title"
                    className="flex-grow border rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <Form method="post" onSubmit={handleUpdateSubmit} className="ml-4 flex items-center">
                    <input type="hidden" name="id" value={todo.id} />
                    <input type="hidden" name="_action" value="update" />
                    <input type="hidden" name="newTitle" value={newTitle} />
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition duration-150"
                    >
                      Update
                    </button>
                  </Form>
                </>
              ) : (
                <>
                  <span className="text-gray-700 flex-grow">{todo.title}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(todo.id, todo.title)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      Edit
                    </button>
                    <Form method="post">
                      <input type="hidden" name="id" value={todo.id} />
                      <input type="hidden" name="_action" value="delete" />
                      <button
                        type="submit"
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </Form>
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
