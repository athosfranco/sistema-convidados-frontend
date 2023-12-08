import { CloseTwoTone } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Backdrop,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";

const ListaConvidados = () => {
  const [fetchError, setFetchError] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [listaConvidados, setListaConvidados] = useState<any>([]);
  const [novoConvidadoInput, setNovoConvidadoInput] = useState("");
  const [confirmDeleteAllDialog, setConfirmDeleteAllDialog] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedConvidado, setSelectedConvidado] = useState<any | null>(null);
  const baseUrl = "https://sistema-convidados-backend.vercel.app/convidados";
  // const baseUrl = "http://localhost:3000/convidados";
  const fetchConvidados = () => {
    setNovoConvidadoInput("");
    setFetchLoading(true);
    axios
      .get(baseUrl)
      .then((res) => {
        setFetchLoading(false);
        setTotalCount(res.data.length);

        let listaOrdenada = [...res.data].sort((a: any, b: any) => {
          return (
            new Date(b.dataCriacao).getTime() -
            new Date(a.dataCriacao).getTime()
          ); // Cria uma cópia da array
        });

        switch (sortConfig) {
          case "recent-first":
            break;
          case "valid-first":
            listaOrdenada = listaOrdenada.sort((a: any, b: any) => {
              if (a.confirmado && !b.confirmado) return -1;
              if (!a.confirmado && b.confirmado) return 1;
              return 0;
            });
            break;
          case "invalid-first":
            listaOrdenada = listaOrdenada.sort((a: any, b: any) => {
              if (!a.confirmado && b.confirmado) return -1;
              if (a.confirmado && !b.confirmado) return 1;
              return 0;
            });
            break;
          case "only-invalid":
            listaOrdenada = listaOrdenada
              .filter((convidado: any) => !convidado.confirmado)
              .sort((a: any, b: any) => {
                return (
                  new Date(b.dataCriacao).getTime() -
                  new Date(a.dataCriacao).getTime()
                );
              });
            break;
          case "only-valid":
            listaOrdenada = listaOrdenada
              .filter((convidado: any) => convidado.confirmado)
              .sort((a: any, b: any) => {
                return (
                  new Date(b.dataCriacao).getTime() -
                  new Date(a.dataCriacao).getTime()
                );
              });
            break;
          default:
            break;
        }

        setListaConvidados(listaOrdenada);
        console.log(res);
      })
      .catch((err) => {
        setFetchLoading(false);
        console.log(err);
      });
  };

  useEffect(() => {
    fetchConvidados();
  }, []);

  const handleAddConvidado = () => {
    const dataCriacao = new Date();
    const opcoes = { timeZone: "America/Sao_Paulo" };
    const dataFormatada = dataCriacao.toLocaleString("pt-BR", opcoes);
    if (novoConvidadoInput.includes(",")) {
      const convidadosArray = novoConvidadoInput.split(",");

      convidadosArray.forEach((convidado) => {
        axios
          .post(baseUrl, {
            nome: convidado,
            confirmado: false,
            dataCriacao: dataFormatada,
            dataValidacao: false,
          })
          .then((res) => {
            fetchConvidados();
          })
          .catch();
      });
    } else {
      axios
        .post(baseUrl, {
          nome: novoConvidadoInput,
          confirmado: false,
          dataCriacao: dataFormatada,
          dataValidacao: false,
        })
        .then((res) => {
          fetchConvidados();
        })
        .catch();
    }
  };

  const handleDeleteConvidado = () => {
    if (selectedConvidado) {
      axios
        .delete(`${baseUrl}/${selectedConvidado.id}`)
        .then((res) => {
          setConfirmDialogOpen(false);
          fetchConvidados();
        })
        .catch((err) => {
          alert(err.message);
        });
    }
  };
  const handleConfirmDialogOpen = (convidado: any) => {
    setSelectedConvidado(convidado);
    setConfirmDialogOpen(true);
  };

  const handleValidateConvidado = () => {
    const dataCriacao = new Date();
    const opcoes = { timeZone: "America/Sao_Paulo" };
    const dataFormatada = dataCriacao.toLocaleString("pt-BR", opcoes);
    if (selectedConvidado) {
      const updatedConvidado = {
        ...selectedConvidado,
        confirmado: true,
        dataValidacao: dataFormatada,
      };
      axios
        .put(`${baseUrl}/${selectedConvidado.id}`, updatedConvidado)
        .then((res) => {
          setConfirmDialogOpen(false);
          fetchConvidados();
          const { nome, dataValidacao } = res.data;
          alert(`Ingresso de ${nome} validado com sucesso em ${dataValidacao}`);
        })
        .catch((err) => {
          alert(err.message);
        });
    }
  };
  const handleInvalidateConvidado = () => {
    if (selectedConvidado) {
      const updatedConvidado = {
        ...selectedConvidado,
        confirmado: false,
        dataValidacao: false,
      };
      axios
        .put(`${baseUrl}/${selectedConvidado.id}`, updatedConvidado)
        .then((res) => {
          setConfirmDialogOpen(false);
          fetchConvidados();
        })
        .catch((err) => {
          alert(err.message);
        });
    }
  };

  const handleDeleteAll = () => {
    setConfirmDeleteAllDialog(false);

    axios
      .delete(`${baseUrl}/all`)
      .then((res) => {
        fetchConvidados();
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const [sortConfig, setSortConfig] = useState("recent-first");

  const handleChangeSortConfig = (event: SelectChangeEvent) => {
    setSortConfig(event.target.value as string);
  };

  useEffect(() => {
    fetchConvidados();
  }, [sortConfig]);

  return (
    <>
      <Backdrop
        sx={{
          color: "#ffffff",
          zIndex: (theme: any) => theme.zIndex.drawer + 1,
        }}
        open={fetchLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Card sx={{ p: 4, minWidth: "80vw" }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Ingressos
        </Typography>
        <Stack direction="row" gap={1}>
          <TextField
            value={novoConvidadoInput}
            variant="filled"
            size="small"
            fullWidth
            label="Nome do convidado"
            onChange={(e) => setNovoConvidadoInput(e.target.value)}
          />
          <Button
            disabled={novoConvidadoInput.length === 0}
            size="small"
            variant="contained"
            onClick={handleAddConvidado}
          >
            Adicionar
          </Button>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          gap={1}
          sx={{ mt: 2 }}
        >
          <Button
            size="large"
            variant="outlined"
            color="error"
            onClick={() => setConfirmDeleteAllDialog(true)}
          >
            Limpar lista
          </Button>
          <Stack direction="row" alignItems="center" gap={1}>
            <FormControl sx={{ width: 250 }}>
              <InputLabel id="ordenacao-select">Ordenação</InputLabel>
              <Select
                labelId="ordenacao-select"
                id="ordenacao-select-field"
                value={sortConfig}
                label="Ordenação"
                onChange={handleChangeSortConfig}
              >
                <MenuItem value={"recent-first"}>
                  Mais recentes primeiro
                </MenuItem>
                <MenuItem value={"valid-first"}>Validados primeiro</MenuItem>
                <MenuItem value={"invalid-first"}>
                  Não validados primeiro
                </MenuItem>
                <Divider />
                <MenuItem value={"only-valid"}>
                  Apenas ingressos validados
                </MenuItem>
                <MenuItem value={"only-invalid"}>
                  Apenas ingressos não validados
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* <Button
            size="small"
            variant="outlined"
            color="success"
            onClick={() => setConfirmDeleteAllDialog(true)}
          >
            Validar tds
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="info"
            onClick={() => setConfirmDeleteAllDialog(true)}
          >
            Desvalidar tds
          </Button> */}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {listaConvidados.length > 0 ? (
          <>
            {" "}
            <TableContainer
              component={Paper}
              sx={{ overflowY: "scroll", height: "50vh" }}
            >
              <Table aria-label="simple table" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell align="right">Criado em</TableCell>

                    <TableCell align="right">Validado em</TableCell>

                    <TableCell align="right">Ingresso validado</TableCell>
                    {/* Adicionado */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listaConvidados.map((convidado: any) => (
                    <TableRow
                      onClick={() => handleConfirmDialogOpen(convidado)}
                      key={convidado.nome}
                      sx={{
                        height: 70,
                        backgroundColor: convidado.confirmado
                          ? "#e8fcf3"
                          : "#f7e7e7",
                        "&:hover": {
                          backgroundColor: convidado.confirmado
                            ? "#d7fae9"
                            : "#ffe2e2",
                        },
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {convidado.nome}
                      </TableCell>
                      <TableCell align="right">
                        {convidado.dataCriacao || "-"}
                      </TableCell>{" "}
                      <TableCell align="right">
                        {convidado.dataValidacao || "-"}
                      </TableCell>{" "}
                      <TableCell align="right">
                        {convidado.confirmado ? "Sim ✅" : "Não ❌"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="body2" sx={{ mt: 1, color: "#484848" }}>
              Exibindo {listaConvidados.length} de {totalCount} ingressos
            </Typography>
          </>
        ) : (
          <Alert severity="info">
            <AlertTitle>Nenhum ingresso encontrado</AlertTitle>
            Não há nenhum registro de convidados.
          </Alert>
        )}
      </Card>
      <Dialog
        open={confirmDeleteAllDialog}
        onClose={() => setConfirmDeleteAllDialog(false)}
      >
        <DialogTitle>🚨 ATENÇÃO</DialogTitle>
        <Divider />
        <DialogContent>
          Tem certeza de que deseja limpar toda a lista de convidados?{" "}
          <strong>Essa ação não pode ser desfeita.</strong>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setConfirmDeleteAllDialog(false)}
            color="primary"
          >
            Cancelar
          </Button>
          <Button onClick={handleDeleteAll} color="error" variant="outlined">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <DialogTitle>Gerenciar ingresso</DialogTitle>
          <IconButton onClick={() => setConfirmDialogOpen(false)}>
            <CloseTwoTone />
          </IconButton>
        </Stack>

        <Divider />
        <DialogContent>
          {selectedConvidado && (
            <Stack spacing={2}>
              <Chip label={` NOME: ${selectedConvidado.nome}`}></Chip>
              <Typography>
                {selectedConvidado.confirmado ? (
                  <Alert severity="success">
                    <AlertTitle>Ingresso já foi validado</AlertTitle>
                    Data: {selectedConvidado.dataValidacao}
                  </Alert>
                ) : (
                  <Alert severity="error">Ingresso ainda não validado</Alert>
                )}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          {selectedConvidado && selectedConvidado.confirmado ? (
            <Button
              variant="outlined"
              size="medium"
              color="secondary"
              onClick={handleInvalidateConvidado}
            >
              Desvalidar Ingresso
            </Button>
          ) : (
            <Button
              variant="contained"
              size="medium"
              color="primary"
              onClick={handleValidateConvidado}
            >
              Validar Ingresso
            </Button>
          )}

          <Button
            variant="contained"
            size="medium"
            color="error"
            onClick={handleDeleteConvidado}
          >
            Apagar Ingresso
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ListaConvidados;
