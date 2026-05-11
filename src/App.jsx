import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import DirectoryView from "./DirectoryView";
import Auth from "./Auth";

function App() {
  const [user, setUser] = useState(null);

  const router = createBrowserRouter([
    {
      path: "/*",
      element: user ? (
        <DirectoryView setUser={setUser} />
      ) : (
        <Navigate to="/auth" />
      ),
    },
    {
      path: "/auth",
      element: <Auth setUser={setUser} />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
