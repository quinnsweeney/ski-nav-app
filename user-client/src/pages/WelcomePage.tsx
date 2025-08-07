import { Sheet, Typography, Button } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import MountainIcon from '@mui/icons-material/Landscape';

export default function WelcomePage() {
    const navigate = useNavigate();

    return (
        <Sheet
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                gap: 2,
                p: 2,
                background: 'linear-gradient(170deg, #02203c, #00437c)',
                color: 'white',
                position: 'fixed',
                top: 0,
                left: 0,
            }}
        >
            <MountainIcon sx={{ fontSize: 60 }} />
            <Typography level="h1" component="h1" sx={{ color: 'neutral.300'}}>
                Welcome to SkiFinder
            </Typography>
            <Typography level="h4" sx={{ maxWidth: '500px', color: 'neutral.300' }}>
                Your personal guide to the slopes. Find the perfect route, every time.
            </Typography>
            <Button
                size="lg"
                onClick={() => navigate('/resorts')}
                sx={{ mt: 2 }}
            >
                Find Your Resort
            </Button>
        </Sheet>
    );
};