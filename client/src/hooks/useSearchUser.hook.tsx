"use client";
import { serverUrl } from "@/utils/serverUrl";
import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useQuery, UseQueryResult } from "react-query";
import { User } from "@/types/UserTypes";
function useSearchUser(searchUser: string, delay: number) {
  const searchItemQuery: UseQueryResult<
    User[],
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["search-user", searchUser],
    queryFn: async () => {
      const response = await axios.get(`${serverUrl}/`);
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
