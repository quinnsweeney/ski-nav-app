import { Button, FormControl, FormLabel, Input, Sheet, Typography } from "@mui/joy";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password })
            .then(response => {
                login(response.data.token);
            })
            .catch(err => {
                setError('Invalid email or password.');
                console.error(err);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <Sheet sx={{
            maxWidth: '400px',
            margin: '4rem auto',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: 'lg'
        }}>
            <Typography level="h2" component="h1" sx={{ textAlign: 'center', mb: 2 }}>
                Admin Login
            </Typography>
            <form onSubmit={handleSubmit}>
                <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </FormControl>
                <FormControl sx={{ mt: 2 }}>
                    <FormLabel>Password</FormLabel>
                    <Input name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </FormControl>
                {error && <Typography color="danger" sx={{ mt: 2, textAlign: 'center' }}>{error}</Typography>}
                <Button type="submit" fullWidth sx={{ mt: 3 }} loading={isSubmitting}>
                    Log In
                </Button>
            </form>
        </Sheet>
    );
}