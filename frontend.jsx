import { render } from "solid-js/web";
import "./app.css";
import App from "./frontend/App";

// Example usage
// const oldJson = { foo: "bar" };
// const newJson = { foo: "baz" };

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

render(() => <App key={0} />, root);
