//AXIOS
import axios from "axios";
//UTILS
import { getCategories, postCategory } from "../redux/slices/categoriesSlice";

const urlBack = import.meta.env.VITE_BACKEND_URL;

export const fetchCategories = async (dispatch) => {
  try {
    const { data } = await axios.get(`${urlBack}/category/`, {
      withCredentials: true,
    });
    dispatch(getCategories(data));
  } catch (error) {
    return error;
  }
};

export const fetchPostCategories = async (dispatch, name) => {
  try {
    const { data } = await axios.post(`${urlBack}/category/`, name, {
      withCredentials: true,
    });
    dispatch(postCategory(data));
  } catch (error) {
    return error;
  }
};
