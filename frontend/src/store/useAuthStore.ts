import {create} from 'zustand'
import {createJSONStorage, persist} from "zustand/middleware";

type AuthState = {
    isAuthenticated: boolean
    username: string | null
    surname: string | null
    is_staff: boolean
    login: (name: string, surname: string | null, is_staff: boolean) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            username: null,
            surname: null,
            is_staff: false,
            login: (name, surname, is_staff) => set({
                isAuthenticated: true,
                username: name,
                surname: surname,
                is_staff: is_staff
            }),
            logout: () => set({isAuthenticated: false, username: null, surname: null, is_staff: false}),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)
