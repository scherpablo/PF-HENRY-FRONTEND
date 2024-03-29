//HOOKS
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  total: 0,
  id: null,
  cartUser: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const storedProducts = JSON.parse(
        window.localStorage.getItem("storedProducts")
      );
      
      if (storedProducts) {
        state.items = Object.values(storedProducts).map((product) => ({ ...product }));
      }
    },
    resetCart: (state) => {
      state.items = [];
    },
    updateItem: (state, action) => {
      const { id, count } = action.payload;
      const itemIndex = state.items.findIndex((item) => item.id === id);

      if (itemIndex !== -1) {
        const updatedItem = {
          ...state.items[itemIndex],
          count: count,
        };

        const updatedItems = [...state.items];
        updatedItems[itemIndex] = updatedItem;

        state.items = updatedItems;

        const storedProducts = JSON.parse(window.localStorage.getItem("storedProducts")) || [];
        const updatedStoredProducts = storedProducts.map((product) =>
          product.id === id ? { ...product, count } : product
        );

        window.localStorage.setItem(
          "storedProducts",
          JSON.stringify(updatedStoredProducts)
        );
      }
    },
    removeItem: (state, action) => {
      const productIdToRemove = action.payload;
      state.items = state.items.filter((item) => item.id !== productIdToRemove);

  window.localStorage.setItem(
    "storedProducts",
    JSON.stringify(state.items)
  );
    },
    totalItem: (state, action) => {
      const totalPrice = state.items.reduce(
        (accumulator, currentItem) =>
          accumulator + currentItem.price * currentItem.count,
        0
      );
      state.total = totalPrice;
    },
    idShop: (state, action) => {
      state.id = action.payload
    },
    getCart: (state, action) => {
      const sortCartUser = action.payload
      state.cartUser = sortCartUser.sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
      })
    }
  },
});

export const { addItem, updateItem, removeItem, totalItem, idShop, resetCart, getCart } = cartSlice.actions;
export default cartSlice.reducer;

