import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("inside login")
    const frontendHost = process.env.NEXT_PUBLIC_FRONTEND_HOST!;
    const clientId = process.env.GITHUB_CLIENT_ID!;

    const redirectUri = `${frontendHost}/callback`;

    const url = new URL("https://github.com/login/oauth/authorize");
    
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", "read:user user:email");

    res.status(200).json({ url: url.toString() });
}
