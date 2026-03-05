import {ITokenPair} from "@/shared/api/model/ITokenPair";


export async function refreshSession(refreshToken: string): Promise<ITokenPair | null> {
    const baseUrl = process.env.INTERNAL_API_URL;

    try {
        const response = await fetch(`${baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Cookie': `refresh_token=${refreshToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            console.error(`Middleware Refresh Failed: ${response.status}`);
            return null;
        }

        const data = await response.json();


        return data as ITokenPair;
    } catch (error) {
        console.error("Refresh fetch error:", error);
        return null;
    }
}