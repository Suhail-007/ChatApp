/// <reference types="vite/client" />
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Message {
  _id: string;
  user: string;
  text: string;
  sender: 'user' | 'ai';
  mood?: string;
  createdAt: string;
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
};

const BASE_URL = import.meta.env.BASE_URL || 'http://localhost:5000'; // Vite env

export const fetchMessages = createAsyncThunk<Message[], string>(
  'chat/fetchMessages',
  async (token: string, thunkAPI) => {
    try {
      const res = await fetch(`${BASE_URL}/api/chat/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch messages');
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const sendMessage = createAsyncThunk<Message[], { text: string; token: string }>(
  'chat/sendMessage',
  async ({ text, token }: { text: string; token: string }, thunkAPI) => {
    try {
      const res = await fetch(`${BASE_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send message');
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMessages.pending, (state: ChatState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state: ChatState, action: PayloadAction<Message[]>) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state: ChatState, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
      })
      .addCase(sendMessage.pending, (state: ChatState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state: ChatState, action: PayloadAction<Message[]>) => {
        state.loading = false;
        state.messages = [...state.messages, ...action.payload];
      })
      .addCase(sendMessage.rejected, (state: ChatState, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
      });
  },
});

export default chatSlice.reducer;
