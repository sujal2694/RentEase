import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { StoreContext } from './StoreContext';

export const StoreContextProvider = ({ children }) => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const adminURL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';
  const [menu, setMenu] = useState('home');
  const [slider, setSlider] = useState(false);
  const [currState, setCurrState] = useState('sign up');
  const [loginPopUp, setLoginPopUp] = useState(false);
  const [userData, setUserData] = useState({ name: '', email: '', password: '' });
  const [token, setToken] = useState(localStorage.getItem("token") || ""); 
  const [loadedCartToken, setLoadedCartToken] = useState("");
  const [cartLoadError, setCartLoadError] = useState("");
  const [cartItems, setCartItems] = useState({});
  const [rentalTerms, setRentalTerms] = useState({});
  const [productsList, setProductsList] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [productLoadError, setProductLoadError] = useState("");
  const [searchBar, setSearchBar] = useState(false);
  const deliveryFees = 40;
  const cartReady = !token || loadedCartToken === token;

  const addTocart = async (itemid) => {
    if (!token) {
      setLoginPopUp(true);
      toast("Please sign in or create an account to add rentals.");
      return false;
    }
    if (!cartReady) return false;
    const id = String(itemid);
    try {
      const response = await axios.post(url + "/api/cart/add", { itemid: id }, { headers: { token } });
      if (!response.data.success) throw new Error(response.data.message || "Unable to add this rental");
      setCartItems(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      if (rentalTerms[id]) {
        try {
          const termResponse = await axios.post(url + "/api/cart/rental-term", { itemid: id, months: rentalTerms[id] }, { headers: { token } });
          if (!termResponse.data.success) throw new Error(termResponse.data.message || "Unable to save rental term");
        } catch (termError) {
          console.error("Unable to save selected rental term", termError);
          toast.error(termError.response?.data?.message || termError.message || "Unable to save rental term");
        }
      }
      return true;
    } catch (err) {
      console.error("Cart add request failed", err);
      toast.error(err.response?.data?.message || err.message || "Unable to add this rental");
      return false;
    }
  }

  const removeFromcart = async (itemid) => {
    const id = String(itemid);
    if (!token || !cartReady) return;
    try {
      const response = await axios.post(url + "/api/cart/remove", { itemid: id }, { headers: { token } });
      if (!response.data.success) throw new Error(response.data.message || "Unable to update your basket");
      if ((cartItems[id] || 0) <= 1) {
        setRentalTerms(current => {
          const { [id]: _removedTerm, ...remaining } = current;
          return remaining;
        });
      }
      setCartItems(prev => {
        const count = prev[id] || 0;
        if (count <= 1) {
          const { [id]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [id]: count - 1 };
      });
    } catch (err) {
      console.error("Cart remove request failed", err);
      toast.error(err.response?.data?.message || err.message || "Unable to update your basket");
    }
  }

  const setRentalTerm = async (itemid, months) => {
    const id = String(itemid);
    const term = Number(months);
    setRentalTerms(prev => ({ ...prev, [id]: term }));
    if (!token || !cartReady || !cartItems[id]) return;
    try {
      const response = await axios.post(url + "/api/cart/rental-term", { itemid: id, months: term }, { headers: { token } });
      if (!response.data.success) throw new Error(response.data.message || "Unable to save rental term");
    } catch (err) {
      console.error("Rental term update failed", err);
      toast.error(err.response?.data?.message || err.message || "Unable to save rental term");
    }
  }

  const getTotalcartAmt = () => {
    let totalAmt = 0;
    for (const itemId in cartItems) {
      const qty = cartItems[itemId];
      if (!qty) continue;
      const itemInfo = productsList.find((p) => p._id === itemId);
      if (itemInfo) totalAmt += Number(itemInfo.monthlyRent || 0) * Number(rentalTerms[itemId] || 1) * qty;
    }
    return totalAmt;
  }

  const getSecurityDepositTotal = () => Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
    const itemInfo = productsList.find((product) => product._id === itemId);
    return total + (itemInfo ? Number(itemInfo.securityDeposit || 0) * quantity : 0);
  }, 0);

  
  const fetchProductsList = useCallback(async () => {
    try {
      const response = await axios.get(url + "/api/product/list");
      if (!response.data.success) throw new Error(response.data.message || "Unable to load rental catalog");
      if (!Array.isArray(response.data.data)) throw new Error("The rental catalog response was invalid");
      setProductsList(response.data.data);
      setProductLoadError("");
    } catch (err) {
      console.error("Failed to fetch products", err);
      setProductLoadError(err.response?.data?.message || err.message || "Unable to load rental catalog");
      toast.error("Unable to load the rental catalog");
    } finally {
      setProductsLoaded(true);
    }
  }, [url])

  
  const cartData = useCallback(async (authToken) => {
    if (localStorage.getItem("token") !== authToken) return;
    try {
      const response = await axios.post(url + "/api/cart/get", {}, { headers: { token: authToken } });
      if (localStorage.getItem("token") !== authToken) return;
      if (!response.data.success || !response.data.cartData) throw new Error(response.data.message || "The saved rental basket response was invalid");
      setCartItems(response.data.cartData);
      setRentalTerms(current => ({ ...current, ...(response.data.rentalTerms || {}) }));
      setCartLoadError("");
      setLoadedCartToken(authToken);
    } catch (err) {
      if (localStorage.getItem("token") !== authToken) return;
      console.error("Failed to fetch cart", err);
      setCartLoadError(err.response?.data?.message || err.message || "Unable to load your saved rental basket");
      toast.error("Unable to load your saved rental basket");
    }
  }, [url])

  useEffect(() => {
    fetchProductsList();
  }, [fetchProductsList])

  useEffect(() => {
    if (token) {
      cartData(token);
    } else {
      setCartItems({});
      setRentalTerms({});
      setLoadedCartToken("");
      setCartLoadError("");
    }
  }, [token, cartData])

  const cartCount = Object.values(cartItems).reduce((total, quantity) => total + Number(quantity || 0), 0);
  const clearRentalBasket = useCallback(() => {
    setCartItems({});
    setRentalTerms({});
    setLoadedCartToken("");
    setCartLoadError("");
  }, []);

  const contextValue = {
    menu, setMenu,
    slider, setSlider,
    currState, setCurrState,
    loginPopUp, setLoginPopUp,
    url,
    userData, setUserData,
    token, setToken,
    cartItems,
    cartCount,
    cartReady,
    cartLoadError,
    clearRentalBasket,
    rentalTerms,
    setRentalTerm,
    addTocart,
    removeFromcart,
    getTotalcartAmt,
    getSecurityDepositTotal,
    productsList, setProductsList,
    productsLoaded,
    productLoadError,
    deliveryFees,
    searchBar, setSearchBar,
    adminURL,
  };

  return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
};
