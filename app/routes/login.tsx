import { Form, json, redirect } from "@remix-run/react";
import { ActionFunction } from "@remix-run/node";
import React from "react";

export const action: ActionFunction = async ({ request }) => {
  const formData = new URLSearchParams(await request.text());
  const username = formData.get("username");
  const password = formData.get("password");

  // Add authentication logic here (e.g., validate username and password)
  if (username === "arturk" && password === "123") {
    return redirect("/todos");
  } else {
    return json({ error: "Invalid credentials" }, { status: 401 });
  }
};

export default function Login() {
  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl mb-4">Login</h1>
      <Form method="post">
        <div className="mb-4">
          <label htmlFor="username" className="block">Username</label>
          <input id="username" name="username" type="text" className="w-full border p-2" required />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block">Password</label>
          <input id="password" name="password" type="password" className="w-full border p-2" required />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Login</button>
      </Form>
    </div>
  );
}
