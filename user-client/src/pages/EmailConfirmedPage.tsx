import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/joy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function EmailConfirmedPage() {
  return (
    <Card
      sx={{
        height: "100dvh",
        width: "100vw",
        p: 0,
        m: 0,
        borderRadius: 0,
        border: "none",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.surface",
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 3,
          p: { xs: 3, md: 4 },
          maxWidth: "400px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: "success.50",
            color: "success.500",
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 48 }} />
        </Box>
        
        <Typography
          level="h2"
          component="h1"
          sx={{
            fontSize: { xs: "1.75rem", md: "2rem" },
            fontWeight: "bold",
            color: "text.primary",
          }}
        >
          Email Confirmed!
        </Typography>
        
        <Typography
          level="body-lg"
          sx={{
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          Your email has been successfully confirmed. You can now close this page.
        </Typography>
      </CardContent>
    </Card>
  );
}