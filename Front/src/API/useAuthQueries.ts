import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, errorMessage, waitForRefresh } from "./client";
import { closeAuthDialogs } from "../Utils/authDialogs";
import type { Login, Register, User } from "../Utils/Types";
import { resetUser, setUser } from "../Utils/usePlanerStore";

const AUTH_BASE_URL = "/auth/";
const authRequestOptions = {
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
};

export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ["user"],
    queryFn: async ({ signal }) => {
      try {
        const response = await api.get<User>(AUTH_BASE_URL + "me", {
          withCredentials: true,
          signal,
        });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) return null;
        throw error;
      }
    },
    retry: false,
  });
}

export function useRegister() {
  return useAuthentication<Register>("register", "Registration successful");
}

export function useLogin() {
  return useAuthentication<Login>("login", "Login successful");
}

function useAuthentication<Credentials extends Login>(
  action: "login" | "register",
  successMessage: string,
) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: Credentials) => {
      await queryClient.cancelQueries();
      await waitForRefresh();
      const response = await api.post(AUTH_BASE_URL + action, credentials, authRequestOptions);
      return response.data;
    },
    onSuccess: async (data) => {
      // Discard data from the previous account before exposing the new session.
      await queryClient.cancelQueries();
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "user" });
      queryClient.setQueryData<User | null>(["user"], data.user);
      setUser(data.user);
      closeAuthDialogs();
      navigate("/plans", { replace: true });
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(errorMessage(error));
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await queryClient.cancelQueries();
      await waitForRefresh();
      const response = await api.delete(AUTH_BASE_URL + "logout", authRequestOptions);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "user" });
      queryClient.setQueryData<User | null>(["user"], null);
      closeAuthDialogs();
      resetUser();
      navigate("/", { replace: true });
      toast.success("Logout successful");
    },
    onError: (error) => {
      toast.error(errorMessage(error));
    },
  });
}
