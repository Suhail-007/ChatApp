import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { registerUser, loginUser, logout } from './slices/authSlice';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  ThemeProvider,
  CssBaseline,
  IconButton,
} from '@mui/material';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { lightTheme, darkTheme } from './theme';
import './App.css';
import Chat from './components/Chat';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, token, loading, error } = useAppSelector(state => state.auth);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [darkMode, setDarkMode] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      dispatch(loginUser({ email: form.email, password: form.password }));
    } else {
      dispatch(registerUser(form));
    }
  };

  if (user && token) {
    return (
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <Box sx={{ position: 'fixed', right: 20, top: 20 }}>
          <IconButton
            onClick={() => setDarkMode(!darkMode)}
            color='inherit'>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        <Chat token={token} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
        sx={{
          background: theme =>
            `linear-gradient(45deg, ${theme.palette.primary.main}22, ${theme.palette.background.default})`,
        }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            minWidth: 350,
            maxWidth: 400,
            borderRadius: 3,
            position: 'relative',
          }}>
          <Typography
            variant='h5'
            mb={2}
            align='center'>
            {isLogin ? 'Login' : 'Register'}
          </Typography>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <TextField
                label='Username'
                name='username'
                value={form.username}
                onChange={handleChange}
                fullWidth
                margin='normal'
                required
              />
            )}
            <TextField
              label='Email'
              name='email'
              type='email'
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin='normal'
              required
            />
            <TextField
              label='Password'
              name='password'
              type='password'
              value={form.password}
              onChange={handleChange}
              fullWidth
              margin='normal'
              required
            />
            <Button
              type='submit'
              variant='contained'
              color='primary'
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}>
              {isLogin ? 'Login' : 'Register'}
            </Button>
          </form>
          <Button
            onClick={() => setIsLogin(v => !v)}
            color='secondary'
            fullWidth
            sx={{ mt: 2 }}>
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </Button>
          {user && (
            <Box
              mt={3}
              textAlign='center'>
              <Typography variant='body1'>
                Logged in as: <b>{user.username}</b>
              </Typography>
              <Button
                onClick={() => dispatch(logout())}
                color='error'
                sx={{ mt: 1 }}>
                Logout
              </Button>
            </Box>
          )}
          {error && (
            <Alert
              severity='error'
              sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default App;
