import {
  Alert,
  AlertTitle,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
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
        const listaOrdenada = res.data.sort((a: any, b: any) => {
          // Ordena com base na data de criação em ordem decrescente
          return (
            new Date(b.dataCriacao).getTime() -
            new Date(a.dataCriacao).getTime()
          );
        });
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

  return (
    <>
      <Card sx={{ p: 4, minWidth: "70vw" }}>
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
            Add
          </Button>
        </Stack>
        <Stack direction="row" gap={1} sx={{ mt: 1 }}>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => setConfirmDeleteAllDialog(true)}
          >
            Limpar lista
          </Button>

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
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          Tem certeza de que deseja limpar toda a lista de convidados? Essa ação
          não pode ser desfeita.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDeleteAllDialog(false)}
            color="primary"
          >
            Cancelar
          </Button>
          <Button onClick={handleDeleteAll} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Gerenciar ingresso</DialogTitle>
        <DialogContent>
          {selectedConvidado && (
            <Stack spacing={2}>
              <Typography>{selectedConvidado.nome}</Typography>
              <Typography>
                {selectedConvidado.confirmado
                  ? "Ingresso já está validado ✅"
                  : "O ingresso ainda não foi validado ❌"}
              </Typography>
              <Divider />
              <Stack direction="row" spacing={2}>
                {selectedConvidado.confirmado ? (
                  <Button
                    variant="contained"
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
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ListaConvidados;
