import { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const getStringBetween = (start: string, end: string, text: string): string => {
        const startIndex = text.indexOf(start);
        if (startIndex < 0) {
            return '';
        }

        const endIndex = text.indexOf(end, startIndex + start.length);
        if (endIndex < 0) {
            return text.substring(startIndex + start.length);
        }

        return text.substring(startIndex + start.length, endIndex);
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

    const url = req.body.url;

    try {
        if (!url) {
            throw new Error("Required parameter `url`");
        }

        const videoCode = url.split("/").slice(-1)[0];
        
        try {
            const response = await axiosClient.get(`https://dood.pro/e/${videoCode}`);
            const body = response.data;
            const pass_md5_url = getStringBetween("$.get('/pass_md5/", "'", body);
            const token = pass_md5_url.split("/").slice(-1)[0];
            const title = getStringBetween("<title>", "</title>", body);

            if (!pass_md5_url) {
                console.error(`Body: \n${body}`);
                throw new Error("Failed to get data");
            }

            res.status(200).json({
                result: true,
                data: {
                    title: title,
                    token: token,
                    pass_md5_url: pass_md5_url,
                }
            });
        } catch (error) {
            console.error(`Error: ${error}`);
            throw new Error("Failed to get data");
        }

    } catch (error) {
        console.error(error);
        res.status(400).json({ result: false, message: error.message });
    }
}
