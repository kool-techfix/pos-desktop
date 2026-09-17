"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AppState, Business, Sale, User } from "@/types/types";

import {
  clearSession,
  createInitialState,
  getSessionId,
  loadState,
  saveState,
  setSessionId,
} from "@/lib/storage";

import {
  addProduct as addProductService,
  deleteProduct as deleteProductService,
  increaseStock as increaseStockService,
  updateProduct as updateProductService,
  type ProductInput,
  type ProductUpdate,
} from "@/lib/products";

import {
  createSale as createSaleService,
  type CreateSaleInput,
} from "@/lib/sales";

import {
  addSalesPerson,
  deleteSalesPerson,
  setSalesPersonActive,
  updateSalesPerson,
  type SalesPersonInput,
  type SalesPersonUpdate,
} from "@/lib/salesPerson";

import {
  loginAsAdmin,
  loginAsSalesPerson,
  logout,
  registerAdmin,
  type AdminLoginInput,
  type AdminRegistrationInput,
  type SalesPersonLoginInput,
} from "@/lib/auth";

import {
  createBusiness,
  updateBusiness as updateBusinessService,
} from "@/lib/business";

type AppContextValue = {
  state: AppState;
  user: User | null;
  business: Business;
  isInitialized: boolean;

  registerAdmin: (input: AdminRegistrationInput) => Promise<User>;
  registerBusiness: (input: {
    businessName: string;
    name: string;
    username: string;
    password: string;
  }) => Promise<User>;
  loginAsAdmin: (input: AdminLoginInput) => Promise<User>;
  loginAsSalesPerson: (input: SalesPersonLoginInput) => Promise<User>;
  signOut: () => Promise<void>;

  addProduct: (input: ProductInput) => void;

  updateProduct: (productId: string, updates: ProductUpdate) => void;

  deleteProduct: (productId: string) => void;

  increaseProductStock: (productId: string, quantity: number) => void;

  createSale: (input: CreateSaleInput) => Sale;

  addSalesPerson: (input: SalesPersonInput) => User;

  updateSalesPerson: (
    salesPersonId: string,
    updates: SalesPersonUpdate,
  ) => void;

  setSalesPersonActive: (salesPersonId: string, active: boolean) => void;

  deleteSalesPerson: (salesPersonId: string) => void;

  updateBusiness: (updates: Partial<Business>) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [sessionId, setCurrentSession] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        const [storedState, storedSessionId] = await Promise.all([
          loadState(),
          getSessionId(),
        ]);

        if (cancelled) {
          return;
        }

        setState(storedState);
        setCurrentSession(storedSessionId);
      } finally {
        if (!cancelled) {
          setIsInitialized(true);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Resolve the currently authenticated user from the
   * persisted application state and current session.
   */
  const user = useMemo(() => {
    if (!sessionId) {
      return null;
    }

    return (
      state.users.find((entry) => entry.id === sessionId && entry.active) ??
      null
    );
  }, [state.users, sessionId]);

  const business = state.business;

  /*
   * Persist application state whenever it changes.
   */
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    void saveState(state);
  }, [state, isInitialized]);

  /*
   * If the currently stored session belongs to a user that
   * has been removed or deactivated, clear the session.
   */
  useEffect(() => {
    if (!sessionId || user) {
      return;
    }

    let cancelled = false;

    void clearSession().finally(() => {
      if (!cancelled) {
        setCurrentSession(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [sessionId, user]);

  /*
   * ADMIN REGISTRATION
   */
  const handleRegisterAdmin = useCallback(
    async (input: AdminRegistrationInput): Promise<User> => {
      const nextUsers = await registerAdmin(state.users, input);

      const registeredUser = nextUsers.find(
        (candidate) =>
          candidate.role === "ADMIN" &&
          candidate.username?.trim().toLowerCase() ===
            input.username.trim().toLowerCase(),
      );

      if (!registeredUser) {
        throw new Error("Unable to create admin account");
      }

      setState((current) => ({
        ...current,
        users: nextUsers,
      }));

      return registeredUser;
    },
    [state.users],
  );

  const handleRegisterBusiness = useCallback(
    async (input: {
      businessName: string;
      name: string;
      username: string;
      password: string;
    }): Promise<User> => {
      const business = createBusiness(input.businessName);

      const nextUsers = await registerAdmin(state.users, {
        name: input.name,
        username: input.username,
        password: input.password,
      });

      const createdAdmin = nextUsers.find(
        (candidate) =>
          candidate.role === "ADMIN" &&
          candidate.username?.trim().toLowerCase() ===
            input.username.trim().toLowerCase(),
      );

      if (!createdAdmin) {
        throw new Error("Unable to create admin account");
      }

      setState((current) => ({
        ...current,
        business,
        users: nextUsers,
      }));

      await setSessionId(createdAdmin.id);
      setCurrentSession(createdAdmin.id);

      return createdAdmin;
    },
    [state.users],
  );

  /*
   * ADMIN LOGIN
   */
  const handleLoginAsAdmin = useCallback(
    async (input: AdminLoginInput): Promise<User> => {
      const result = await loginAsAdmin(state.users, input);

      setCurrentSession(result.user.id);

      return result.user;
    },
    [state.users],
  );

  /*
   * SALES PERSON LOGIN
   */
  const handleLoginAsSalesPerson = useCallback(
    async (input: SalesPersonLoginInput): Promise<User> => {
      const result = await loginAsSalesPerson(state.users, input);

      setCurrentSession(result.user.id);

      return result.user;
    },
    [state.users],
  );

  /*
   * LOGOUT
   */
  const handleSignOut = useCallback(async (): Promise<void> => {
    await logout();
    setCurrentSession(null);
  }, []);

  /*
   * PRODUCTS
   */
  const handleAddProduct = useCallback((input: ProductInput) => {
    setState((current) => ({
      ...current,
      products: addProductService(current.products, input),
    }));
  }, []);

  const handleUpdateProduct = useCallback(
    (productId: string, updates: ProductUpdate) => {
      setState((current) => ({
        ...current,
        products: updateProductService(current.products, productId, updates),
      }));
    },
    [],
  );

  const handleDeleteProduct = useCallback((productId: string) => {
    setState((current) => ({
      ...current,
      products: deleteProductService(current.products, productId),
    }));
  }, []);

  const handleIncreaseProductStock = useCallback(
    (productId: string, quantity: number) => {
      setState((current) => ({
        ...current,
        products: increaseStockService(current.products, productId, quantity),
      }));
    },
    [],
  );

  /*
   * SALES
   *
   * createSale() returns both the new sale and the
   * updated products with stock deducted.
   */
  const handleCreateSale = useCallback((input: CreateSaleInput): Sale => {
    let createdSale: Sale | undefined;

    setState((current) => {
      const result = createSaleService(current.sales, current.products, input);

      createdSale = result.sale;

      return {
        ...current,
        sales: [...current.sales, result.sale],
        products: result.products,
      };
    });

    if (!createdSale) {
      throw new Error("Unable to create sale");
    }

    return createdSale;
  }, []);

  /*
   * SALES PERSONS
   */
  const handleAddSalesPerson = useCallback((input: SalesPersonInput): User => {
    let createdUser: User | undefined;

    setState((current) => {
      const nextUsers = addSalesPerson(current.users, input);

      createdUser = nextUsers.find(
        (candidate) =>
          candidate.role === "SALES_PERSON" &&
          candidate.name === input.name.trim(),
      );

      return {
        ...current,
        users: nextUsers,
      };
    });

    if (!createdUser) {
      throw new Error("Unable to create sales person");
    }

    return createdUser;
  }, []);

  const handleUpdateSalesPerson = useCallback(
    (salesPersonId: string, updates: SalesPersonUpdate) => {
      setState((current) => ({
        ...current,
        users: updateSalesPerson(current.users, salesPersonId, updates),
      }));
    },
    [],
  );

  const handleSetSalesPersonActive = useCallback(
    (salesPersonId: string, active: boolean) => {
      setState((current) => ({
        ...current,
        users: setSalesPersonActive(current.users, salesPersonId, active),
      }));
    },
    [],
  );

  const handleDeleteSalesPerson = useCallback((salesPersonId: string) => {
    setState((current) => ({
      ...current,
      users: deleteSalesPerson(current.users, salesPersonId),
    }));
  }, []);

  /*
   * BUSINESS
   */
  const handleUpdateBusiness = useCallback((updates: Partial<Business>) => {
    setState((current) => ({
      ...current,
      business: updateBusinessService(current.business, updates),
    }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      user,
      business,
      isInitialized,

      registerAdmin: handleRegisterAdmin,
      registerBusiness: handleRegisterBusiness,

      loginAsAdmin: handleLoginAsAdmin,
      loginAsSalesPerson: handleLoginAsSalesPerson,
      signOut: handleSignOut,

      addProduct: handleAddProduct,
      updateProduct: handleUpdateProduct,
      deleteProduct: handleDeleteProduct,
      increaseProductStock: handleIncreaseProductStock,

      createSale: handleCreateSale,

      addSalesPerson: handleAddSalesPerson,
      updateSalesPerson: handleUpdateSalesPerson,
      setSalesPersonActive: handleSetSalesPersonActive,
      deleteSalesPerson: handleDeleteSalesPerson,

      updateBusiness: handleUpdateBusiness,
    }),
    [
      state,
      user,
      business,
      isInitialized,

      handleRegisterAdmin,
      handleRegisterBusiness,

      handleLoginAsAdmin,
      handleLoginAsSalesPerson,
      handleSignOut,

      handleAddProduct,
      handleUpdateProduct,
      handleDeleteProduct,
      handleIncreaseProductStock,

      handleCreateSale,

      handleAddSalesPerson,
      handleUpdateSalesPerson,
      handleSetSalesPersonActive,
      handleDeleteSalesPerson,

      handleUpdateBusiness,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside an AppProvider");
  }

  return context;
}
