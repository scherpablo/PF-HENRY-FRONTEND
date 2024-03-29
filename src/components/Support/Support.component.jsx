//HOOKS
import { useState } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import axios from "axios";
//MATERIAL UI
import {
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";

//HELPERS
import {
  validateName,
  validatePhone,
  validateEmail,
  validateArea,
} from "../../helpers/supportValidateForm";
//UTILS
import { textSupport } from "../../utils/objectsTexts";
//SWEET ALERT
import Swal from "sweetalert2";
//FIREBASE
import { userSubmitForm } from "../../services/firebaseAnayticsServices";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const reCaptchaKey = import.meta.env.VITE_RECAPTCHA_V3;

const SupportComponent = () => {
  // ESTADOS
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");
  const [postRequest, setPostRequest] = useState(null);
  const [formComplete, setFormComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //SOLICITUD POST
  const postDataRequest = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/mailer/support_mail`, {
        name,
        phone,
        email,
        content: area,
      });
      setPostRequest(data);
      return data;
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al enviar el formulario",
        text: `${error}`,
        confirmButtonColor: "#fd611a",
      });
    }
  };

  //MANEJO DE ERRORES
  const [errorName, setErrorName] = useState({
    error: false,
    message: "",
  });
  const [errorPhone, setErrorPhone] = useState({
    error: false,
    message: "",
  });
  const [errorEmail, setErrorEmail] = useState({
    error: false,
    message: "",
  });
  const [errorArea, setErrorArea] = useState({
    error: false,
    message: "",
  });

  //HANDLES CHANGES
  const handleChangeName = (value) => {
    setName(value);
    setErrorName(() => {
      const error = value.trim() !== "" && !validateName(value);
      return {
        error,
        message: error
          ? "El nombre debe tener al menos 3 caracteres y no puede contener números"
          : "",
      };
    });
    updateFormComplete();
  };

  const handleChangePhone = (value) => {
    setPhone(value);
    setErrorPhone(() => {
      const error = value.trim() !== "" && !validatePhone(value);
      return {
        error,
        message: error ? "El teléfono debe tener 10 dígitos" : "",
      };
    });
    updateFormComplete();
  };

  const handleChangeEmail = (value) => {
    setEmail(value);
    setErrorEmail(() => {
      const error = value.trim() !== "" && !validateEmail(value);
      return {
        error,
        message: error ? "El correo electrónico no es válido" : "",
      };
    });
    updateFormComplete();
  };

  const handleChangeArea = (value) => {
    setArea(value);
    setErrorArea(() => {
      const error = value.trim() !== "" && !validateArea(value);
      return {
        error,
        message: error ? "El mensaje debe tener al menos 50 caracteres" : "",
      };
    });
    updateFormComplete();
  };

  const updateFormComplete = () => {
    setFormComplete(
      validateName(name) &&
        validatePhone(phone) &&
        validateEmail(email) &&
        validateArea(area)
    );
  };

  //HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !validateName(name) ||
      !validatePhone(phone) ||
      !validateEmail(email) ||
      !validateArea(area)
    ) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Hay errores en el formulario. Por favor reviselo.",
      });
      return;
    }
    try {
      setIsLoading(true);

      const postData = await postDataRequest();

      if (postData.success) {
        Swal.fire({
          icon: "success",
          title: "Mensaje Enviado",
          text: "Responderemos a la brevedad.",
        });
        setName("");
        setPhone("");
        setEmail("");
        setArea("");
        setPostRequest(null);
        setFormComplete(false);
        userSubmitForm("Soporte");
      } else {
        const errorMsg = postRequest?.response;
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Hubo un error en el servidor.",
        });
      }
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Hubo un error al enviar el formulario.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* BOX TITULO SOPORTE */}
      <Box
        sx={{
          backgroundColor: "#000",
          width: "100%",
          height: "120px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            textTransform: "uppercase",
            fontWeight: "800",
            fontSize: "1.7rem",
            margin: "10px",
          }}
        >
          Soporte
        </Typography>
      </Box>
      {/* CIERRE BOX TITULO SOPORTE */}

      {/* BOX FORM Y CAJA TEXTO */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          margin: "0 auto",
          "@media (max-width: 1140px)": {
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey} language="es">
          {/* BOX FORM */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: "40%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "50px",
              "@media (max-width: 1140px)": {
                width: "100%",
                marginBottom: "-10px",
                marginTop: "10px",
                order: "2",
              },
              "@media (max-width: 480px)": {
                marginBottom: "70px",
              },
            }}
          >
            <TextField
              id="name"
              label="Nombre"
              type="string"
              variant="outlined"
              required={true}
              error={errorName.error}
              helperText={errorName.message}
              value={name}
              name="name"
              autoComplete="name"
              onChange={(e) => handleChangeName(e.target.value)}
            />
            <TextField
              id="phone"
              label="Teléfono"
              type="phone"
              variant="outlined"
              required={true}
              error={errorPhone.error}
              helperText={errorPhone.message}
              value={phone}
              name="phone"
              autoComplete="phone"
              onChange={(e) => handleChangePhone(e.target.value)}
              sx={{ margin: "20px 0" }}
            />
            <TextField
              id="email"
              label="Correo Electrónico"
              type="email"
              variant="outlined"
              required={true}
              error={errorEmail.error}
              helperText={errorEmail.message}
              value={email}
              name="email"
              autoComplete="email"
              onChange={(e) => handleChangeEmail(e.target.value)}
              sx={{ marginBottom: "20px" }}
            />
            <TextareaAutosize
              id="contenet"
              disabled={false}
              minRows={10}
              size="lg"
              name="Outlined"
              variant="outlined"
              required={true}
              error={errorArea.error ? errorArea : undefined}
              placeholder="Ejemplo: Tengo un CPU que no enciende. Queda la pantalla negra."
              value={area}
              onChange={(e) => handleChangeArea(e.target.value)}
              style={{
                borderRadius: "5px",
                border: "1px solid #C7D0DD",
                fontFamily: "Roboto",
                fontSize: "16px",
                padding: "10px",
              }}
            />
            {errorArea.error && (
              <Typography
                variant="body2"
                color="error"
                sx={{ margin: "10px 0 25px 15px", fontSize: "12px" }}
              >
                {errorArea.message}
              </Typography>
            )}
            <Button
              variant="contained"
              type="submit"
              disabled={!formComplete || isLoading}
              sx={{
                backgroundColor: "#fd611a",
                padding: "12px 0",
                "&:hover": { backgroundColor: "#000" },
                fontSize: "18px",
                marginTop: "20px",
              }}
              endIcon={<SendIcon />}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Enviar"
              )}
            </Button>
          </Box>
          {/* CIERRE BOX FORM */}
        </GoogleReCaptchaProvider>

        {/* BOX CAJA TEXTO */}
        <Box
          sx={{
            width: "40%",
            display: "flex",
            justifyContent: "center",
            padding: "50px",
            "@media (max-width: 1140px)": {
              width: "100%",
              textAlign: "justify",
              borderBottom: "1px solid #00000050",
            },
          }}
        >
          {textSupport.map((item, index) => (
            <Box key={index}>
              <Typography
                variant="h4"
                sx={{
                  marginBottom: "10px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {item.title}
              </Typography>
              {item.content.map((paragraph, pIndex) => (
                <Typography
                  key={pIndex}
                  sx={{
                    marginBottom: "10px",
                    textAlign: "justify",
                    "@media (max-width: 480px)": { margin: "20px 0" },
                  }}
                >
                  {paragraph.text && <span>{paragraph.text}</span>}
                  {paragraph.textOne && (
                    <span style={{ fontWeight: "bold" }}>
                      {paragraph.textOne}
                    </span>
                  )}
                </Typography>
              ))}
            </Box>
          ))}
        </Box>
        {/* CIERRE BOX CAJA TEXTO */}
      </Box>
      {/* CIERRE BOX FORM Y CAJA TEXTO */}
    </>
  );
};

export default SupportComponent;
