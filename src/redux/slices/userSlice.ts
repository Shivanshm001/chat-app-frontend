import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserI {
    _id: string,
    name?: string;
    username: string,
    email: string,
    avatar?: string;
    createdAt: string,
    updatedAt: string,
}

const initState: {
    user: UserI | null,
    isLoggedIn: boolean
} = {
    user: null,
    isLoggedIn: false
};

const userSlice = createSlice({
    name: "user",
    initialState: initState,
    reducers: {
        setUserInfo(state, action: PayloadAction<UserI>) {
            state.user = action.payload;
            state.isLoggedIn = true;
        },
        clearUserInfo(state) {
            state.user = null;
            state.isLoggedIn = false;
        },
    },
});

export const { setUserInfo, clearUserInfo } = userSlice.actions;
export default userSlice.reducer;