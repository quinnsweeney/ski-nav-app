import { CircularProgress, Sheet } from "@mui/joy";
import { useAuth } from "../contexts/AuthContext";
import AdminDashboard from "./AdminDashboard";
import Login from "./Login";

export default function AppContent() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <Sheet sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Sheet>;
    }

    return isAuthenticated ? <AdminDashboard /> : <Login />;
}