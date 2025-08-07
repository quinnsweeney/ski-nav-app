import { Box, Button, Sheet, Typography } from "@mui/joy";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import type { Resort } from "../types";
import ResortDetails from "./ResortDetails";
import Resorts from "./Resorts";

export default function AdminDashboard() {
    const { logout } = useAuth();
    const [selectedResort, setSelectedResort] = useState<Resort | null>(null);


    return (
        <Sheet sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography level="h2">Admin Dashboard</Typography>
                <Button color="danger" onClick={logout}>Log Out</Button>
            </Box>
            <Sheet sx={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', borderRadius: '12px', boxShadow: 'lg', fontFamily: 'sans-serif' }}>
                {selectedResort ? (<ResortDetails resort={selectedResort} onBack={() => setSelectedResort(null)} />) : (<Resorts onSelectResort={(resort) => setSelectedResort(resort)} />)}
            </Sheet>
        </Sheet>
    );
}