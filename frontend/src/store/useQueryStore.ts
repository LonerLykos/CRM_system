import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

type QueryState = {
    mySearch: string
    setQuery: (search: string) => void
    clearQuery: () => void
}

export const useQueryStore = create<QueryState>()(
    persist(
        (set) => ({
            mySearch: '',
            setQuery: (search) => set({mySearch: search}),
            clearQuery: () => set({mySearch: ''}),
        }),
        {
        name: 'query-store',
        storage: createJSONStorage(() => sessionStorage),
        },
    )
)
