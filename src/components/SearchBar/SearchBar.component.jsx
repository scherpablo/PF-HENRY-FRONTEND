//HOOKS
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
//MATERIAL UI
import {
  Input,
  Box,
  Button,
  styled,
  Typography,
  CircularProgress,
  Avatar,
} from "@mui/material";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Autocomplete } from "@mui/material";
//COMPONENTS
import LoginModal from "../LoginModal/LoginModal.component";
import RegisterModal from "../RegisterModal/RegisterModal.component";
import UserMenu from "../UserMenu/UserMenu.component";
import Notification from "../Notifications/Notifications.component";
//REDUX
import { logUser } from "../../redux/slices/userSlice";
import { addItem } from "../../redux/slices/cartSlice";
import { fetchWishList } from "../../services/wishListServices";
//SERVICES
import { fetchSearch, fetchChage } from "../../services/productServices";
import { getUserById } from "../../services/userServices";
//HELPERS
import PATHROUTES from "../../helpers/pathRoute";
//UTILS
import { getDataFromSelectedPersistanceMethod } from "../../utils/authMethodSpliter";
//IMAGES - ICONS
import img from "../../../public/favicon.ico";
//FIREBASE
import { userSearchEvent } from "../../services/firebaseAnayticsServices";
import {
  fetchDeleteHistoryItem,
  fetchHistoryUSer,
  fetchPostHistoryItem,
} from "../../services/historyUserService";
import Swal from "sweetalert2";
export default function SearchAppBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItemCount = useSelector((state) => state.cart.items.length);
  const { login } = useSelector((state) => state.user);
  const { historyUser } = useSelector((state) => state.historyUser);
  const { inputName } = useSelector((state) => state.product);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const [registerModalIsOpen, setRegisterModalIsOpen] = useState(false);
  const cookieStatus = useSelector((state) => state.cookies.cookiesAccepted);
  const authData = getDataFromSelectedPersistanceMethod(cookieStatus);
  const userRole = authData ? authData.userRole : null;
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [aux, setAux] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const isHistoryUserItem = (suggestion) => {
    if (suggestion === "el usuario aun no posee historial.") {
      return false;
    }
    return historyUser.some((history) => history.value === suggestion);
  };
  useEffect(() => {
    dispatch(addItem());
    if (login) {
      fetchHistoryUSer(authData?.userId, dispatch);
    }
  }, [login, aux]);

  useEffect(() => {
    const newSuggestions = login
      ? historyUser.map((history) => history.value)
      : ["el usuario no posee historial"];
    setSuggestions(newSuggestions);
  }, [login, historyUser, aux]);

  useEffect(() => {
    dispatch(addItem());
    if (login) {
      fetchHistoryUSer(authData.userId, dispatch);
    } else {
      setAutocompleteSuggestions([
        "el usuario debe loguearse para tener historial.",
      ]);
    }
  }, [login, aux]);

  const Img = styled("img")({
    width: 200,
    height: 140,
  });

  const getUserInfo = async (token) => {
    if (token !== undefined) {
      const response = await getUserById(token.userId, authData.jwt);
      dispatch(logUser({ userObject: { ...response, rolId: token.userRole } }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    Swal.fire({
      icon: "info",
      allowOutsideClick: false,
      title: "Por favor espere mientras procesamos la información",
      showConfirmButton: false,
    });
    Swal.showLoading();
    login && (await fetchPostHistoryItem(authData.userId, inputName, dispatch));
    await fetchSearch(inputName)(dispatch);
    setAux(!aux);
    setInputValue("");
    userSearchEvent(inputName);
    Swal.close();
    navigate(PATHROUTES.PRODUCTS);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSubmit(event);
    }
  };

  const handleCartClick = () => {
    navigate(PATHROUTES.SHOPCART);
  };

  useEffect(() => {
    const userToken = getDataFromSelectedPersistanceMethod(cookieStatus);
    if (userToken?.login) {
      getUserInfo(userToken);
    }
  }, [cookieStatus]);

  useEffect(() => {
    if (authData?.login && authData?.userRole === "customer") {
      fetchWishList(dispatch, cookieStatus);
    }
  }, [authData?.userRole]);

  const handleAutocomplete = (value) => {
    if (!value) {
      setAutocompleteSuggestions([]);
      setShowAutocomplete(false);
      return;
    }
    if (!login) {
      setAutocompleteSuggestions([
        "Para tener historial por favor regístrese.",
      ]);
      setShowAutocomplete(true);
      return;
    }

    const matchingSuggestions = historyUser
      .map((history) => history.value)
      .filter(
        (suggestion) =>
          suggestion && suggestion.toLowerCase().includes(value.toLowerCase())
      );

    setAutocompleteSuggestions(matchingSuggestions);
    setShowAutocomplete(matchingSuggestions.length > 0);
  };
  const handleAutocompleteSelect = (selectedSuggestion) => {
    setInputValue(selectedSuggestion);
    dispatch(fetchChage(selectedSuggestion));
    setShowAutocomplete(false);
  };

  useEffect(() => {
    handleAutocomplete(inputValue);
  }, [inputValue, historyUser, aux]);

  const handleDelete = async (value) => {
    Swal.fire({
      icon: "info",
      allowOutsideClick: false,
      title: "Por favor espere mientras procesamos la información",
      showConfirmButton: false,
    });
    Swal.showLoading();
    await fetchDeleteHistoryItem(authData.userId, value, dispatch);
    setAutocompleteSuggestions((prevSuggestions) =>
      prevSuggestions.filter((suggestion) => suggestion !== value)
    );
    setShowAutocomplete(false);
    setAux(!aux);
    Swal.close();
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: "1.2rem",
        flexDirection: { xxs: "column", sm: "row" },
        justifyContent: "space-between",
        paddingBlock: 1,
        alignItems: "center",
        minHeight: 80,
        paddingInline: "3rem",
        background: "#FFFFFF",
        zIndex: "9991",
      }}
    >
      <Box
        sx={{
          display: "flex",
          minWidth: "220px",
          border: "0.1px solid black",
          borderRadius: 2,
          borderTopRightRadius: 50,
          borderBottomRightRadius: 50,
        }}
      >
        <Avatar src={img} alt="HIPERMEGARED" />
        <Input
          type="text"
          value={inputValue}
          placeholder=" Buscador"
          onChange={(e) => {
            dispatch(fetchChage(e.target.value));
            setInputValue(e.target.value);
            handleAutocomplete(e.target.value);
          }}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          onKeyPress={handleKeyPress}
          sx={{
            position: "relative",
            width: { xs: 300, sm: 500, xl: 800 },
            fontSize: 20,
            color: "black",
            ml: 1,
          }}
          disableUnderline
        />
        {showAutocomplete && (
          <Box
            sx={{
              position: "absolute",
              top: "65px",
              border:"solid 1px black",
              zIndex: 1,
              backgroundColor: "white",
              boxShadow: 5,
              borderRadius: 2,
              width: "40%",
              minWidth: "220px",
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            {autocompleteSuggestions.map((suggestion, index) => (
              <Box
                key={suggestion}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  border:"solid black 0.5px"
                }}
              >
                <Box
                  key={index}
                  onMouseDown={() => handleAutocompleteSelect(suggestion)}
                  style={{
                    padding: "8px",
                    cursor: "pointer",
                    color:"black",
                    borderBottom: "1px solid #ccc",
                  }}
                >
                  {suggestion}
                </Box>
                {isHistoryUserItem(suggestion) && (
                  <Button
                    sx={{
                      padding: "8px",
                      backgroundColor: "black",
                      fontWeight: "bold",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#fd611a",
                        color: "black",
                        cursor: "pointer",
                      },
                    }}
                    id={suggestion}
                    onClick={(e) => {
                      handleDelete(e.target.id);
                    }}
                  >
                    <DeleteIcon
                      id={suggestion}
                      onClick={(e) => {
                        handleDelete(suggestion);
                      }}
                    />
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        )}
        <Button
          type="submit"
          onClick={handleSubmit}
          sx={{
            alignItems: "stretch",
            height: 40,
            backgroundColor: "black",
            borderTopRightRadius: 50,
            borderBottomRightRadius: 50,
            "&:hover": { backgroundColor: "#fd611a" },
          }}
        >
          <SearchIcon
            sx={{
              color: "white",
              "&:hover": { color: "black" },
            }}
          />
        </Button>
      </Box>
      <Box
        sx={{
          display: "flex",

          flexDirection: "row",
          alignItems: "center",
          justifyContent: { xxs: "space-around", lg: "flex-end" },
          gap: "2em",
          color: "black",
          [`@media (max-width:1200px)`]: {
            width: "50%",
          },
        }}
      >
        {userRole === "customer" ? (
          <Box
            sx={{
              position: "relative",
              ml: "2em",
            }}
          >
            <ShoppingCartIcon
              /*src={carrito}*/ sx={{ fontSize: "32px", cursor: "pointer" }}
              onClick={handleCartClick}
            />
            {cartItemCount > -1 && (
              <span
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  transform: "translate(50%, -50%)",
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "0.2em 0.5em",
                  fontSize: "0.7em",
                }}
              >
                {cartItemCount}
              </span>
            )}
          </Box>
        ) : userRole === "admin" ? (
          <Box>
            <AdminPanelSettingsIcon
              sx={{ display: "flex", margin: "0 auto", fontSize: "32px" }}
            />{" "}
            <Typography sx={{ fontSize: "14px" }}>Admin</Typography>
          </Box>
        ) : userRole === "technician" ? (
          <Box>
            <ManageAccountsIcon
              sx={{ display: "flex", margin: "0 auto", fontSize: "32px" }}
            />{" "}
            <Typography sx={{ fontSize: "14px" }}>Técnico</Typography>
          </Box>
        ) : /*<ShoppingCartIcon sx={{ fontSize: "32px" }} onClick={handleCartClick} />*/
        null}
        {userRole === "customer" && login === true && (
          <Box>
            <Notification />
          </Box>
        )}

        {login === false ? (
          <Box
            sx={{
              borderRadius: 2,
              backgroundColor: "#fd611a",
            }}
          >
            <Button
              startIcon={<AccountBoxIcon />}
              color="inherit"
              sx={{
                height: "100%",
                color: "white",
                flexWrap: 'nowrap',
                minWidth: '180px',
              }}
              onClick={() => {
                setLoginModalIsOpen(true);
              }}
            >
              INICIAR SESIÓN
            </Button>
          </Box>
        ) : (
          <Box>
            <UserMenu />
          </Box>
        )}
      </Box>

      <LoginModal
        isOpen={loginModalIsOpen}
        setLoginModalIsOpen={setLoginModalIsOpen}
        setRegisterModalIsOpen={setRegisterModalIsOpen}
      />
      <RegisterModal
        isOpen={registerModalIsOpen}
        setRegisterModalIsOpen={setRegisterModalIsOpen}
      />
      {/* <ConnectedProductBox cartItemCount={cartItemCount} */}
    </Box>
  );
}
