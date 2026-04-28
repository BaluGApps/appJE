// // src/utils/store.js
// import {configureStore} from '@reduxjs/toolkit';
// import {api} from './apiSlice';

// export const store = configureStore({
//   reducer: {
//     [api.reducerPath]: api.reducer,
//   },
//   middleware: getDefaultMiddleware =>
//     getDefaultMiddleware().concat(api.middleware),
// });

import {configureStore} from '@reduxjs/toolkit';
import {api} from './apiSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(api.middleware),
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
});
