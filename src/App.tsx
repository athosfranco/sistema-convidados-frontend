import "./App.css";
import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CircularProgress,
  createTheme,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import ListaConvidados from "./assets/components/listaConvidados/listaConvidados";
import axios from "axios";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const baseUrl =
    "https://sistema-convidados-backend.vercel.app/confirmar-convidado";
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? "dark" : "light",
          primary: {
            main: "#3f51b5",
          },
          secondary: {
            main: "#f50057",
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                borderRadius: 18,
              },
            },
            defaultProps: {
              disableElevation: true,
              variant: "contained",
            },
          },
        },
      }),
    [isDarkMode]
  );

  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isValidatingInvite, setIsValidatingInvite] = useState(false);
  const [successValidation, setSuccessValidation] = useState(false);
  const [errorValidation, setErrorValidation] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  const validatePassword = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    if (passwordInput === "athosrei") {
      localStorage.setItem("sistema-ellen", "authorized");
      setPasswordError(false);
      setLoginSuccess(true);
    } else {
      setPasswordError(true);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const invite = searchParams.get("invite");
    if (invite) {
      setIsValidatingInvite(true);
      if (localStorage.getItem("sistema-ellen")) {
        axios
          .put(baseUrl, { nome: invite })
          .then((res) => {
            setSuccessValidation(true);
            setErrorValidation(false);
          })
          .catch((err) => {
            setSuccessValidation(false);
            setErrorValidation(err);
          });
      } else {
        setUnauthorized(true);
      }
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      {loginSuccess ? (
        <ListaConvidados />
      ) : isValidatingInvite ? (
        <Card sx={{ p: 5, m: 2 }}>
          {successValidation && (
            <Alert severity="success">
              <AlertTitle>Ingresso validado!</AlertTitle>
              Bem vindo!
            </Alert>
          )}
          {errorValidation && (
            <Alert severity="error">
              <AlertTitle>Ingresso não é válido</AlertTitle>
              {JSON.stringify(errorValidation)}
            </Alert>
          )}
          {unauthorized && (
            <Alert severity="info">
              <AlertTitle>
                Apresente o seu ingresso na entrada do evento
              </AlertTitle>
              Você não precisa ler esse QR Code! Quem deve lê-lo é a pessoa
              responsável no evento.
            </Alert>
          )}
        </Card>
      ) : (
        <Card sx={{ p: 5, m: 2 }}>
          {!loading ? (
            <Stack
              direction="column"
              justifyContent="center"
              alignContent="center"
            >
              <Stack
                direction="column"
                gap={1}
                justifyContent="center"
                alignItems="center"
              >
                <Typography variant="h4" textAlign="center">
                  MSGCF
                </Typography>
                <Typography variant="h6" textAlign="center">
                  Melhor Sistema de Gerenciamento de Convidados Já Feito
                </Typography>
                <TextField
                  fullWidth
                  error={passwordError}
                  onChange={(e) => setPasswordInput(e.target.value.trim())}
                  label="Senha"
                  variant="filled"
                  type="password"
                  sx={{ mt: 2 }}
                />
                <Button
                  disabled={passwordInput.length === 0}
                  variant="contained"
                  onClick={validatePassword}
                  sx={{ width: "100%" }}
                >
                  Entrar
                </Button>
                {passwordError && (
                  <Alert severity="error">Senha incorreta!</Alert>
                )}
              </Stack>
            </Stack>
          ) : (
            <Stack
              direction="column"
              gap={1}
              justifyContent="center"
              alignItems="center"
            >
              <CircularProgress />
              <Typography>Te acalma</Typography>
            </Stack>
          )}
        </Card>
      )}
    </ThemeProvider>
  );
}

export default App;
