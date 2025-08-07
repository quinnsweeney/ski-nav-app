import { CssVarsProvider } from "@mui/joy"
import AuthProvider from "./contexts/AuthContext";
import AppContent from "./components/AppContent";

export default function App() {

    return (
        <CssVarsProvider>
          <AuthProvider>
            <AppContent />
            </AuthProvider>
        </CssVarsProvider>
    );
}