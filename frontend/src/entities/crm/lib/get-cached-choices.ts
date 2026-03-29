import {unstable_cache} from "next/cache";
import {crmService} from "@/entities/crm";


export const getCachedChoices = unstable_cache(
    async () => {
        const { ok, result } = await crmService.getChoices();

        if (!ok || !result) {
            throw new Error("Failed to fetch choices from API");
        }
        return result;
    },
    ['crm_choices'],
    {
        revalidate: 3600,
        tags: ['choices']
    }
)
