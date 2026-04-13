import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { AUTH_REFRESH_EVENT } from "../api/client";

export function useMe() {
  const token = localStorage.getItem("token");

  return useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    enabled: !!token,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegister(options = {}) {
  const { onSuccess: userOnSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ username, email, password }) => 
      authApi.register(username, email, password),
    onSuccess: (data, variables, context) => {
      if (userOnSuccess) {
        userOnSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
}

export function useLogin(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess: userOnSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ username, password }) => authApi.login(username, password),
    onSuccess: async (data, variables, context) => {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      window.dispatchEvent(new CustomEvent(AUTH_REFRESH_EVENT));
      
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      if (userOnSuccess) {
        userOnSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
}

export function useLogout(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess: userOnSuccess } = options;

  return () => {
    authApi.logout();
    queryClient.setQueryData(["me"], null);
    if (userOnSuccess) {
      userOnSuccess();
    }
  };
}