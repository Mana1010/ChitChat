"use client";
import { GROUP_SERVER_URL } from "@/utils/serverUrl";
import axios, { AxiosError } from "axios";
import { useQuery, UseQueryResult } from "react-query";
import { GroupChatList } from "@/types/group.types";
function useSearchGroup(searchGroup: string) {
  const searchItemQuery: UseQueryResult<
    GroupChatList[],
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["search-group", searchGroup],
    queryFn: async () => {
      const response = await axios.get(
        `${GROUP_SERVER_URL}/conversation/search/group?search=${searchGroup}`
      );
      return response.data.message;
    },
    enabled: !!searchGroup,
  });

  return {
    searchGroup: searchItemQuery.data,
    isLoading: searchItemQuery.isLoading,
  };
}

export default useSearchGroup;
