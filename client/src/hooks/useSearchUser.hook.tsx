"use client";
import { PRIVATE_SERVER_URL } from "@/utils/serverUrl";
import axios, { AxiosError } from "axios";
import { useQuery, UseQueryResult } from "react-query";
import { User } from "@/types/UserTypes";
function useSearchUser(searchUser: string) {
  const searchItemQuery: UseQueryResult<
    User[],
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["search-user", searchUser],
    queryFn: async () => {
      const response = await axios.get(
        `${PRIVATE_SERVER_URL}/conversation/search/user?search=${searchUser}`
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
