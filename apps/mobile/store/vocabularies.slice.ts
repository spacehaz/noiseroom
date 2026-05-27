import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vocabulary } from '@noiseroom/cipher';

interface VocabulariesState {
  byChat: Record<string, Vocabulary>;
}

const initialState: VocabulariesState = {
  byChat: {},
};

export const vocabulariesSlice = createSlice({
  name: 'vocabularies',
  initialState,
  reducers: {
    setVocabulary(state, action: PayloadAction<{ chatId: string; vocabulary: Vocabulary }>) {
      state.byChat[action.payload.chatId] = action.payload.vocabulary;
    },
    removeVocabulary(state, action: PayloadAction<string>) {
      delete state.byChat[action.payload];
    },
    loadVocabularies(state, action: PayloadAction<Record<string, Vocabulary>>) {
      state.byChat = { ...state.byChat, ...action.payload };
    },
    clearVocabularies(state) {
      state.byChat = {};
    },
  },
});

export const { setVocabulary, removeVocabulary, loadVocabularies, clearVocabularies } = vocabulariesSlice.actions;
