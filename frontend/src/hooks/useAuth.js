import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    enabled: !!localStorage.getItem("token"), // only fetch if a token exists
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ username, password }) => authApi.login(username, password),
    onSuccess: async (data) => {
      localStorage.setItem("token", data.access_token);
      // mark old user info as stale, refetch `me` endpoint
      await queryClient.fetchQuery({ queryKey: ["me"], queryFn: authApi.me });  
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    authApi.logout();
    queryClient.setQueryData(["me"], null);
    };
}