import {
  CssVarsProvider,
  Sheet,
} from "@mui/joy";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import ResortListPage from "./pages/ResortListPage";
import ResortPage from "./pages/ResortPage";
import WelcomePage from "./pages/WelcomePage";
import EmailConfirmedPage from "./pages/EmailConfirmedPage";

function App() {
  return (
    <BrowserRouter>
      <CssVarsProvider>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/email-confirmed" element={<EmailConfirmedPage />} />
          <Route
            path="/resorts"
            element={
              <Sheet
                sx={{
                  maxWidth: "500px",
                  minHeight: "90vh",
                  margin: "1rem auto",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "lg",
                }}
              >
                <ResortListPage />
              </Sheet>
            }
          />
          <Route
            path="/:resortSlug"
            element={
              <Sheet
                sx={{
                  maxWidth: "500px",
                  minHeight: "90vh",
                  margin: "1rem auto",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "lg",
                }}
              >
                <ResortPage />
              </Sheet>
            }
          />
        </Routes>
        {/* <Typography
          level="h1"
          component="h1"
          sx={{ textAlign: "center", mb: 2 }}
        >
          Ski Route Finder
        </Typography>

        {apiError && (
          <Sheet
            color="danger"
            variant="soft"
            sx={{ p: 2, mb: 2, borderRadius: "sm" }}
          >
            <Typography color="danger">{apiError}</Typography>
          </Sheet>
        )}

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Finding the best route...</Typography>
          </Box>
        ) : path ? (
          <RouteDisplay path={path} onReset={handleReset} />
        ) : (
          <RouteFinderForm
            resortId={4} // Hardcoded for now, could be dynamic later
            onPathFound={setPath}
            setIsLoading={setIsLoading}
            setApiError={setApiError}
          />
        )} */}
      </CssVarsProvider>
    </BrowserRouter>
  );
}

export default App;
