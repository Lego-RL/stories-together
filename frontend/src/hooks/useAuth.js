import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    retry: false,
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
  const { onSuccess: userOnSuccess, ...restOptions } = options;

  return () => {
    authApi.logout();
    queryClient.setQueryData(["me"], null);
    if (userOnSuccess) {
      userOnSuccess();
    }
  };
}