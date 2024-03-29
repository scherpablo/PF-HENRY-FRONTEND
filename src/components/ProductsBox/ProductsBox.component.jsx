//HOOKS
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
//MATERIAL UI
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
} from "@mui/material";
//COMPONENTS
import ProductCard from "../ProductCard/ProductCard.component";
//HOOK
import { useLocalStorage } from "../../Hook/useLocalStorage";
//REDUX
import { addItem } from "../../redux/slices/cartSlice";
//ALERT
import Swal from "sweetalert2";
// UTILS
import PATHROUTES from "../../helpers/pathRoute";
import { getDataFromSelectedPersistanceMethod } from "../../utils/authMethodSpliter";
import { fetchProductCartPost } from "../../services/cartServices";

const ProductBox = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [storedProducts, setStoredProducts] = useLocalStorage();
  const { productsToShow, isLoading } = useSelector((state) => state.product);
  const [animationComplete, setAnimationComplete] = useState(false);
  const { login } = useSelector((state) => state.user);
  const cookieStatus = useSelector((state) => state.cookies.cookiesAccepted);
  const authData = getDataFromSelectedPersistanceMethod(cookieStatus);

  const userRole = authData?.userRole ? authData.userRole : null;
  const isThereAnyProducts = productsToShow.length === 0;

  const handleAddToCart = (product) => {
    if (login === false) {
      Swal.fire({
        icon: "info",
        title: "Acceso Privado",
        text: "Debes estar logueado para agregar productos al carrito.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
    } else if (userRole !== "customer") {
      Swal.fire({
        icon: "info",
        title: "Acceso Privado",
        text: "Tu rol de usuario no posee carrito.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
    } else {
      if (product.ProductStock.amount < 1) {
        Swal.fire({
          icon: "info",
          title: "Producto sin stock",
          text: "Producto momentaneamente no disponible",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Ok",
        });
      } else {
        setStoredProducts(product);
        dispatch(addItem());
        dispatch(fetchProductCartPost(product, cookieStatus));
        Swal.fire({
          icon: "success",
          title: "Producto agregado exitosamente",
          text: "El producto ha sido agregado al carrito.",
          confirmButtonColor: "#fd611a",
          confirmButtonText: "Ir al carrito",
          cancelButtonText: "Seguir comprando",
          cancelButtonColor: "green",
          showCancelButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
            navigate(PATHROUTES.SHOPCART);
            window.scrollTo(0, 0);
          }
        });
      }
    }
  };

  const minimumLoadingTime = 3000;
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimationComplete(true);
    }, minimumLoadingTime); // Cambiado a minimumLoadingTime

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  if (isThereAnyProducts) {
    setTimeout(() => {
      setShowError(true);
    }, minimumLoadingTime);
  }

  if (isLoading || !animationComplete) {
    return (
      <>
        <Box sx={{ minHeight: "70vh" }}>
          <Container
            sx={{
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
              alignContent: "space-around",
              justifyContent: "center",
              marginTop: 15,
              marginBottom: 15,
            }}
          >
            <CircularProgress
              sx={{
                display: "flex",
                justifyContent: "center",
                margin: 5,
                color: "#fd611a",
              }}
            />
            <Typography
              variant="body1"
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              Cargando...
            </Typography>
          </Container>
        </Box>
      </>
    );
  }

  return (
    <>
      <Box>
        <Container
          sx={{
            display: "grid",
            gridTemplateColumns: {
              sm: "repeat(1,1fr)",
              md: "repeat(2,1fr)",
              lg: "repeat(3,1fr)",
            },
            flexDirection: "row",
            gap: 4,
            mt: 2,
            p: 2,
            minHeight: "25vw",
          }}
        >
          {isThereAnyProducts ? (
            showError ? (
              <Typography
                variant="body1"
                sx={{
                  display: "grid",
                  gridColumnStart: 1,
                  gridColumnEnd: 4,
                  alignItems: "center",
                  justifyContent: "center",
                  mt: 4,
                  mb: 4,
                  fontSize: 28,
                  fontWeight: 700,
                  color: "red",
                }}
              >
                No se encontró ningún producto relacionado con su búsqueda!
              </Typography>
            ) : null
          ) : (
            productsToShow.map((product, index) => (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                key={product.id}
              >
                <ProductCardWithFade product={product} index={index} />
                <Button
                  variant="contained"
                  sx={{
                    maxWidth: 270,
                    backgroundColor: "#fd611a",
                    color: "black",
                    transition: "transform 0.3s",
                    marginTop: "10px",
                    "&:hover": {
                      transform: "scale(1.05)",
                      backgroundColor: "#fd611a",
                      color: "white",
                    },
                  }}
                  onClick={() => handleAddToCart(product)}
                >
                  AGREGAR AL CARRITO
                </Button>
              </Box>
            ))
          )}
        </Container>
      </Box>
    </>
  );
};

const ProductCardWithFade = ({ product, index }) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const fadeInTimeout = setTimeout(() => {
      setOpacity(1);
    }, index * 200);

    return () => {
      clearTimeout(fadeInTimeout);
    };
  }, [index]);

  return (
    <>
      <Box>
        <Box
          style={{
            opacity: opacity,
            transition: "opacity 0.5s ease-in",
          }}
        >
          <ProductCard product={product} />
        </Box>
      </Box>
    </>
  );
};

export default ProductBox;
