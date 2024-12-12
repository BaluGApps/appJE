// // src/utils/apiSlice.js
// import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

// const BASE_URL = 'https://apije.pythonanywhere.com/exam/api';

// export const api = createApi({
//   baseQuery: fetchBaseQuery({baseUrl: BASE_URL}),

//   endpoints: builder => ({
//     getQuestions: builder.query({
//       query: ({page, pageSize}) => `/cbt1/?page=${page}&page_size=${pageSize}`,
//     }),
//   }),
// });

// export const {useGetQuestionsQuery} = api;

import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://apije.pythonanywhere.com/exam/api';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({baseUrl: BASE_URL}),
  endpoints: builder => ({
    getQuestions: builder.query({
      query: ({page = 1, pageSize = 10}) => ({
        url: `/cbt1/`,
        params: {page, page_size: pageSize},
        method: 'GET',
      }),
      // Transform the response if needed
      transformResponse: response => {
        // Add any response transformation here if needed
        return response;
      },
      // Add tags for caching if needed
      //   providesTags: ['Questions'],
    }),
    getQuestionsCbt2: builder.query({
      query: ({page = 1, pageSize = 10}) => ({
        url: `/cbt2/`,
        params: {page, page_size: pageSize},
        method: 'GET',
      }),
      // Transform the response if needed
      transformResponse: response => {
        // Add any response transformation here if needed
        return response;
      },
      // Add tags for caching if needed
      // providesTags: ['QuestionsCbt2'],
    }),
  }),
});

export const {useGetQuestionsQuery, useGetQuestionsCbt2Query} = api;
