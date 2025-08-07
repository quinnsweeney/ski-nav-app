import {
  Card,
  CardCover,
  CardContent,
  Typography,
  Button,
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import MountainIcon from "@mui/icons-material/Landscape";
import { useState } from "react";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  return (
    <>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>Hey there!</DialogTitle>
          <Typography>
            Thanks for checking out SkiNav. The data isn't fully populated yet,
            so some routes might be missing.
          </Typography>
          <Typography sx={{ mt: 1 }}>
            If you encounter a long load time, be patient, the API provider I'm
            using is free and goes to sleep after inactivity, causing some
            requests to take a long time.
          </Typography>
          <Button onClick={() => setOpen(false)} sx={{ mt: 2 }}>
            Got it!
          </Button>
        </ModalDialog>
      </Modal>
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
        }}
      >
        <CardCover>
          <img
            src="/landing-img.jpg"
            loading="lazy"
            alt="A stunning view of a snowy mountain range under a clear blue sky, representing a ski resort."
          />
        </CardCover>
        <CardCover
          sx={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.2) 60%)",
          }}
        />
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            textAlign: "center",
            gap: 2,
            p: { xs: 2, md: 4 },
            pb: { xs: 8, md: 10 },
            color: "white",
          }}
        >
          <MountainIcon sx={{ fontSize: { xs: 50, md: 60 }, color: "white" }} />
          <Typography
            level="h1"
            component="h1"
            sx={{
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              color: "white",
            }}
          >
            Welcome to SkiNav
          </Typography>
          <Typography
            level="h4"
            sx={{
              maxWidth: "500px",
              color: "neutral.200",
              fontSize: { xs: "1rem", md: "1.25rem" },
              textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
            }}
          >
            Your personal guide to the slopes. Find the perfect route, every
            time.
          </Typography>
          <Button
            size="lg"
            onClick={() => navigate("/resorts")}
            sx={{ mt: 2, py: 1.5, px: 4, fontSize: "1rem", borderRadius: "xl" }}
          >
            Find Your Resort
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
