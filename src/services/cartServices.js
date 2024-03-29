const urlBack = import.meta.env.VITE_BACKEND_URL;
import axios from "axios";
import { getCart, idShop } from "../redux/slices/cartSlice";
import { getDataFromSelectedPersistanceMethod } from "../utils/authMethodSpliter";
import { getProducts } from "../redux/slices/productSlice";
import { addProductToCart } from "./firebaseAnayticsServices";

export const fetchProductCartPost = (product, cookiesAccepted) => async () => {
  const aux = getDataFromSelectedPersistanceMethod(cookiesAccepted);
  const userId = aux?.userId;
  const jwt = aux?.jwt;
  const { id } = product;
  const data = {
    userId: userId,
    productId: id,
    productQuantity: 1,
  };
  // Envio de notificaciónes a FIREBASE
  addProductToCart(product);

  try {
    const res = await axios.post(`${urlBack}/cart/`, data, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (res.data.Cart === "El usuario ya tiene carrito") {
      await axios.put(`${urlBack}/cart/add`, data, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
    }
  } catch (error) {
    return;
  }
};

export const fetchProductCartGet = (cookiesAccepted) => async () => {
  const aux = getDataFromSelectedPersistanceMethod(cookiesAccepted);
  const userId = aux?.userId;
  const userRole = aux?.userRole;
  const jwt = aux?.jwt;

  if (userRole === "customer") {
    try {
      const res = await axios.get(`${urlBack}/cart/${userId}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      const products = res.data.Products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        ProductImages: product.ProductImages[0],
        count: product.ProductCart.quantity,
        stock: product.ProductStock.amount,
      }));
      const storedProducts = getProducts();
      if (storedProducts.payload === undefined) {
        window.localStorage.setItem("storedProducts", JSON.stringify(products));
      }
    } catch (error) {
      return;
    }
  }
};

export const fetchCountCartPut = (product, cookiesAccepted) => async () => {
  const aux = getDataFromSelectedPersistanceMethod(cookiesAccepted);

  const { userId, jwt } = aux;

  const data = {
    userId: userId,
    productId: product.id,
    productQuantity: product.count,
  };
  try {
    await axios.put(`${urlBack}/cart/edit`, data, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
  } catch (error) {
    return;
  }
};

export const fetchDeleteCartProduct =
  (product, cookiesAccepted) => async () => {
    const aux = getDataFromSelectedPersistanceMethod(cookiesAccepted);
    const { userId, jwt } = aux;
    const data = {
      userId: userId,
      productId: product,
    };
    try {
      await axios.put(`${urlBack}/cart/remove`, data, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
    } catch (error) {
      return;
    }
  };

export const fetchCartMercadoPago =
  (items, cookieAccepted) => async (dispatch) => {
    const aux = getDataFromSelectedPersistanceMethod(cookieAccepted);
    const { userId, jwt } = aux;
    const products = items.map((item) => ({
      title: item.name,
      quantity: item.count,
      unit_price: item.price,
      currency_id: "ARS",
    }));
    try {
      const response = await axios.post(
        `${urlBack}/pagos`,
        { array: products, userId: userId },

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      dispatch(idShop(response.data));
    } catch (error) {
      return;
    }
  };

export const fetchCartUser = (cookieAccepted) => async (dispatch) => {
  const aux = getDataFromSelectedPersistanceMethod(cookieAccepted);
  const formatPrice = (price) => {
    return "$" + price.toFixed(0).replace(/(\d)(?=(\d{3})+$)/g, "$1.");
  };

  const { userId, jwt } = aux;
  try {
    const response = await axios.get(`${urlBack}/pagos/misCompras/${userId}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    if (response.data) {
      const orders = response.data
        .filter((order) => order.Products.length > 0)
        .map((order) => ({
          status: order.status,
          date: order.purchaseDate,
          cartTotal: formatPrice(Number(order.cartTotal)),
          paymentMethod: order.paymentMethod,
          products: order.Products.map((product) => ({
            id: product.id,
            name: product.name,
            budget: product.price,
            image: product.ProductImages[0].address,
            count: product.OrderProduct.quantity,
            ProductCategories: [{ name: product.ProductCategories[0].name }],
            ProductBrands: [{ name: product.ProductBrands[0].name }],
          })),
        }));
      dispatch(getCart(orders));
    }
  } catch (error) {
    return error.message;
  }
};

export const fetchShipments = () => async (dispatch) => {
  try {
    const response = await axios.get(`${urlBack}`);
  } catch (error) {
    return error;
  }
};
