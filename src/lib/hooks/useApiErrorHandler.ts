// src/hooks/useApiErrorHandler.ts
import axios from "axios";
import { addtoast } from "../utils";
export function useApiErrorHandler() {
    return (error: unknown, fallbackMessage = "Something went wrong") => {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || fallbackMessage;
            console.log(error.response)
            console.error("❌ API Error:", {
                status: error.response?.status,
                data: error.response?.data,
            });
            addtoast({
                title: "Error",
                description: message,
            });
        } else {
            console.error("❌ Unexpected Error:", error);
            addtoast({
                title: "Error",
                description: fallbackMessage,
            });
        }
    };
}