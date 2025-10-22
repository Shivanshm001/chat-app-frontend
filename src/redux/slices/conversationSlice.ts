import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Conversation {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    lastMessageTime: string;
    unread: number;
    type: "private" | "group";
};

const initState: Partial<Conversation> = {
    avatar: "",
    id: "index",
    lastMessage: "",
    lastMessageTime: "",
    name: "Select a conversation",
    type: "private",
    unread: 0,
};

const conversationSlice = createSlice({
    initialState: initState,
    name: "conversation",
    reducers: {
        setCurrentConversation(state, action: PayloadAction<Partial<Conversation>>) {
            return { ...state, ...action.payload }
        },
        clearCurrentConversation(state) {
            return initState
        }
    }
});

export default conversationSlice.reducer;
export const { clearCurrentConversation, setCurrentConversation } = conversationSlice.actions;