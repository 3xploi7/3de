import { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';
import qs from 'qs';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const getUniqueParam = (token: string) => {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const n = characters.length;
        let a = '';
        for (let o = 0; o < 10; o++) {
            a += characters.charAt(Math.floor(Math.random() * n));
        }
        return a + `?token=${token}&expiry=` + Date.now();
    };

    const userAgent = req.headers['user-agent'];

    const axiosClient = axios.create({
        headers: {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://dood.pro',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
        }
    });

    const pass_md5 = req.body.pass_md5;
    const token = req.body.token;

    try {
        if (pass_md5 === undefined) {
            throw new Error("Required parameter `pass_md5`");
        }
        if (token === undefined) {
            throw new Error("Required parameter `token`");
        }

        const response = await axiosClient.get(`https://dood.pro/pass_md5/${pass_md5}`);
        const url = response.data + getUniqueParam(token);

        const getSizeResponse = await axiosClient.head(url);
        const sizeFile = getSizeResponse.headers['content-length'];

        res.status(200).json({
            result: true,
            data: {
                url: url,
                size: sizeFile
            }
        });

    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Handle Axios-specific errors
            res.status(400).json({ result: false, message: error.response?.data || error.message });
        } else {
            // Handle other errors
            res.status(400).json({ result: false, message: error.message });
        }
    }
}
