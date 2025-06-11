import { RouterProvider } from "react-router-dom";
import routes from "./router/routes";
import { SnackbarProvider } from "notistack";
import Sidebar from "./components/Sidebar";

const App = () => {
  return (
    <div>
      <SnackbarProvider maxSnack = {3}>
        <RouterProvider router={routes} />
      </SnackbarProvider>
    </div>
  );
};

export default App;
