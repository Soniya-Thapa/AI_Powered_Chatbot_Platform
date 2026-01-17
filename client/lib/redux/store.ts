import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import chatReducer from './slices/chat.slice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      chat: chatReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];