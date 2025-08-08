import type { NextApiRequest, NextApiResponse } from "next";
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const clientId = process.env.GITHUB_CLIENT_ID!;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET!;
    const jwtSecret = process.env.JWT_SECRET!;
    const authorizedEmail = process.env.AUTHORIZED_EMAIL!;
    const frontendHost = process.env.NEXT_PUBLIC_FRONTEND_HOST!;

    const code = req.query.code as string;
    // Step 1: Exchange code for token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {

        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: `${frontendHost}/callback`,
        }),

    });

    if (!tokenRes.ok) {
        const error = await tokenRes.text();
        return res.status(500).json({ error: `GitHub Token Error: ${error}` });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userInfo = await userRes.json();

    const email = userInfo.email;
    const id = userInfo.login;
    const avatarUrl = userInfo.avatar_url;

    const role = email === authorizedEmail ? "ROLE_ADMIN" : "ROLE_USER"; // We dont have use of this.

    const jwtToken = jwt.sign(
        { email, role },
        jwtSecret,
        { subject: `github|${id}`, expiresIn: "1d" } // the 1 day is good for UX here. i am planning to make it so that the app continously save so it will be bad if users have to sign in repeatedly

    );

    res.status(200).json({
        id,
        email,
        avatar: avatarUrl,
        token: jwtToken,
    });
}
