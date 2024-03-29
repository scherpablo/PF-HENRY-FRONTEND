//HOOKS
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
//MATERIAL UI
import {
  Container,
  Box,
  Typography,
  CardMedia,
  styled,
  Button,
  CircularProgress,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Unstable_NumberInput as BaseNumberInput } from "@mui/base/Unstable_NumberInput";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import Swal from "sweetalert2";

//REDUX
import {
  addItem,
  updateItem,
  removeItem,
  totalItem,
} from "../../redux/slices/cartSlice";
//SERVICES
import {
  fetchCartMercadoPago,
  fetchCountCartPut,
  fetchDeleteCartProduct,
} from "../../services/cartServices";

//FIREBASE
import {
  userViewCartEvent,
  removeProductFromCart,
  generatePurchaseOrderEvent,
} from "../../services/firebaseAnayticsServices";
import { useNavigate } from "react-router-dom";

export default function ShoppingCart() {
  const dispatch = useDispatch();
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const navigate = useNavigate();

  const { items, total, id } = useSelector((state) => state.cart);
  const { cookiesAccepted } = useSelector((state) => state.cookies);
  initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: "es-AR" });

  useEffect(() => {
    userViewCartEvent(items, total);
  }, []);

  useEffect(() => {
    dispatch(addItem());
  }, [dispatch]);

  useEffect(() => {
    dispatch(totalItem());
  }, [items]);

  const handleClickShop = async (item) => {
    const { id } = item;
    navigate(`/product/${id}`);
  };

  const ProductMedia = styled(CardMedia)({
    padding: 5,
    height: 140,
    width: 140,
    objectFit: "cover",
    // Estilos adicionales para dispositivos móviles
    "@media (max-width: 600px)": {
      width: "70px",
      height: "70px",
    },
  });

  if (items.length == 0) {
    return (
      <Box
        sx={{
          // display: "flex",
          // alignItems: "center",
          // alignContent: "space-around",
          // justifyContent: "space-around",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "2em",
          textAlign: "center",
          mt: 31,
          mb: 31,
        }}
      >
        <Typography sx={{ m: 10, fontWeight: "bold" }} variant="h2">
          No hay productos en el carrito
        </Typography>
      </Box>
    );
  }

  const formatPrice = (price) => {
    return "$" + price.toFixed(0).replace(/(\d)(?=(\d{3})+$)/g, "$1.");
  };

  const handleChange = (productId, value) => {
    const newValue = parseInt(value) || 1;
    dispatch(updateItem({ id: productId, count: newValue }));
    dispatch(
      fetchCountCartPut({ id: productId, count: newValue }, cookiesAccepted)
    );
  };

  const handleIncrement = (productId) => {
    const currentCount = items.find((item) => item.id === productId).count;
    dispatch(
      updateItem({
        id: productId,
        count: Math.min(currentCount + 1, 10),
      })
    );
  };

  const handleDecrement = (productId) => {
    const currentCount = items.find((item) => item.id === productId).count;
    dispatch(
      updateItem({ id: productId, count: Math.max(currentCount - 1, 1) })
    );
  };

  const handleDelete = (product) => {
    dispatch(removeItem(product));
    dispatch(fetchDeleteCartProduct(product, cookiesAccepted));
    removeProductFromCart(product); // Evento eliminar producto del carrito
  };

  const handleShop = (e) => {
    setIsWalletLoading(true);
    const filter = items.filter((item) => item.stock < 1);
    if (filter.length === 0) {
      dispatch(fetchCartMercadoPago(items, cookiesAccepted));
      generatePurchaseOrderEvent(items, total); //Evento de generación de orden de compra
    } else {
      Swal.fire({
        icon: "info",
        title: "Producto sin stock",
        text: `Producto momentaneamente no disponible ${filter[0].name}`,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
    }
  };
  const customization = {
    visual: {
      buttonBackground: "black",
      borderRadius: "10px",
    },
  };
  return (
    <Container
      display="flex"
      gap={1}
      sx={{
        flexDirection: "column",
        mt: 10,

        marginBottom: "100px",
      }}
    >
      <Typography component="h2" sx={{ textAlign:{xxs:'center', sm:'left'}, fontSize: 30, mb: 5 }}>
        Mi Compra
      </Typography>
      <Box display="flex" flexDirection="column">
        {items.map((item) => (
          <Box
            key={item.id}
            display="flex"
            alignItems="center"
            justifyContent="space-evenly"
            boxShadow="5px 5px 5px #888888"
            borderRadius="8px"
            sx={{ mb: 4 ,
              flexDirection:{xxs:"column",sm:"row"},
              gap:'1em'
            }}
            >
            <ProductMedia
              component="img"
              onClick={() => handleClickShop(item)}
              alt={item.name}
              src={item.ProductImages.address}
              sx={{
                width: { xxs: "140px", sm: "150px"}, // Establece el ancho de la imagen
                cursor: "pointer" 
              }}
            />
            <Typography
              sx={{
                fontSize: "1rem",
                maxWidth: {xxs:'none', sm:"150px"},
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.name}
            </Typography>
            <Box display="flex" gap={1} flexDirection="column" alignItems="center">
              <BaseNumberInput
                min={1}
                max={item.stock}
                id={item.id}
                value={item.count}
                onChange={(event, value) => handleChange(item.id, value)}
                slots={{
                  root: StyledInputRoot,
                  input: StyledInput,
                  incrementButton: StyledButton,
                  decrementButton: StyledButton,
                }}
                slotProps={{
                  incrementButton: {
                    children: (
                      <AddIcon
                        fontSize="small"
                        onClick={() => handleIncrement(item.id)}
                      />
                    ),
                    className: "increment",
                  },
                  decrementButton: {
                    children: (
                      <RemoveIcon
                        fontSize="small"
                        onClick={() => handleDecrement(item.id)}
                      />
                    ),
                    className: "decrement",
                  },
                }}
                sx={{
                  width: {
                    xs: "100px",
                    sm: "150px",
                  },
                  "& .increment, & .decrement": {
                    backgroundColor: "#fd611a",
                    borderColor: "#fd611a",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#e04d17",
                      borderColor: "#e04d17",
                      color: "white",
                    },
                  },
                  "& input": {
                    "&:hover": {
                      borderColor: "#e04d17", // Ajusta el color del borde al pasar el ratón sobre el input
                    },
                    "&:focus": {
                      borderColor: "#fd611a",
                      boxShadow: "0 0 0 3px #fd611a",
                      "&.focused": {
                        borderColor: "#fd611a",
                        boxShadow: "0 0 0 3px #fd611a",
                      },
                    },
                  },
                }}
              />
              {item.stock > 0 && (
                <Typography
                  variant="body1"
                  sx={{
                    paddingTop: { xs: 1, lg: 2 },
                    color: "grey",
                    fontWeight: 700,
                  }}
                >
                  {item.stock}
                  {item.stock === 1
                    ? " unidad disponible"
                    : " unidades disponibles"}{" "}
                </Typography>
              )}
              {item.stock === 0 && (
                <Typography
                  variant="body1"
                  sx={{
                    paddingTop: { xs: 1, lg: 2 },
                    color: "red",
                    fontWeight: 700,
                  }}
                >
                  ¡Producto sin stock!
                </Typography>
              )}
            </Box>
            <Typography>
              Precio: {formatPrice(item.price * item.count)}
            </Typography>
            <Button onClick={() => handleDelete(item.id)}>
              <DeleteForeverIcon sx={{ color: "#fd611a" }} />
            </Button>
          </Box>
        ))}
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              textAlign: "center",
              flexDirection: "row",
              flexWrap: "nowrap",
            }}
          >
            <Typography sx={{ mr: 8, ml: 8, fontSize: 28, fontWeight: "bold" }}>
              Total: {formatPrice(total)}
            </Typography>
          </Box>
          <Button
            onClick={handleShop}
            sx={{
              width: "100%",
              maxWidth: "270px",
              backgroundColor: "#fd611a",
              color: "black",
              transition: "transform 0.3s",
              marginTop: "10px",

              "&:hover": {
                transform: "scale(1.05)",
                backgroundColor: "#fd611a",
                color: "white",
              },
              "@media (max-width: 600px)": {
                fontSize: "0.9rem",
                padding: "10px",
              },
            }}
          >
            Comprar
          </Button>
        </Box>
      </Box>
      <Box>
        {isWalletLoading && (
          <Box
            sx={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <CircularProgress
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 5,
                color: "#fd611a",
              }}
            />
          </Box>
        )}
        {id && (
          <Box sx={{ display: isWalletLoading ? "none" : "block" }}>
            <Wallet
              onReady={() => {
                setIsWalletLoading(false);
              }}
              initialization={{ preferenceId: id }}
              customization={customization}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
}

const blue = {
  100: "#daecff",
  200: "#b6daff",
  300: "#66b2ff",
  400: "#3399ff",
  500: "#007fff",
  600: "#0072e5",
  700: "#0059B2",
  800: "#004c99",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const StyledInputRoot = styled("div")(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400;
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[500]};
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
`
);

const StyledInput = styled("input")(
  ({ theme }) => `
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.375;
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
  border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
  box-shadow: 0px 2px 4px ${
    theme.palette.mode === "dark" ? "rgba(0,0,0, 0.5)" : "rgba(0,0,0, 0.05)"
  };
  border-radius: 8px;
  margin: 0 8px;
  padding: 10px 12px;
  outline: 0;
  min-width: 0;
  width: 4rem;
  text-align: center;

  &:hover {
    border-color: ${blue[400]};
  }

  &:focus {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${
      theme.palette.mode === "dark" ? blue[700] : blue[200]
    };
  }

  &:focus-visible {
    outline: 0;
  }
`
);

const StyledButton = styled("button")(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  line-height: 1.5;
  border: 1px solid;
  border-radius: 999px;
  border-color: ${theme.palette.mode === "dark" ? grey[800] : grey[200]};
  background: ${theme.palette.mode === "dark" ? grey[900] : grey[50]};
  color: ${theme.palette.mode === "dark" ? grey[200] : grey[900]};
  width: 32px;
  height: 32px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 120ms;

  &:hover {
    cursor: pointer;
    background: ${theme.palette.mode === "dark" ? blue[700] : blue[500]};
    border-color: ${theme.palette.mode === "dark" ? blue[500] : blue[400]};
    color: ${grey[50]};
  }

  &:focus-visible {
    outline: 0;
  }

  &.increment {
    order: 1;
  }
`
);
