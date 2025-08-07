import { Box, Typography } from "@mui/joy";
import NavigationIcon from '@mui/icons-material/Navigation';

interface CompassProps {
    distance: number; // in metres
    bearing: number; // in degrees
}

export default function Compass({ distance, bearing }: CompassProps) {
    const formattedDistance = distance < 1000 
        ? `${Math.round(distance)} m`
        : `${(distance / 1000).toFixed(1)} km`;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2, p: 2, backgroundColor: 'neutral.100', borderRadius: 'md' }}>
            <NavigationIcon sx={{ transform: `rotate(${bearing}deg)`, fontSize: 40, color: 'primary.500', transition: 'transform 0.5s' }} />
            <Typography level="h4">{formattedDistance}</Typography>
            <Typography level="body-sm">to next point</Typography>
        </Box>
    );
}