"use client";
import { PRIVATE_SERVER_URL, APP_SERVER_URL } from "@/utils/serverUrl";
import axios, { AxiosError } from "axios";
import { useQuery, UseQueryResult } from "react-query";
import { GroupChat, User } from "@/types/UserTypes";
function useSearchUser(searchUser: string) {
  const searchItemQuery: UseQueryResult<
    User[],
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["search-user", searchUser],
    queryFn: async () => {
      const response = await axios.get(
        `${APP_SERVER_URL}/search/user?search=${searchUser}`
      );
      return response.data.message;
    },
    enabled: !!searchUser,
  });

  return {
    searchUser: searchItemQuery.data,
    isLoading: searchItemQuery.isLoading,
  };
}

export default useSearchUser;
