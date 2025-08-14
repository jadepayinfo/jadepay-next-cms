"use server";

import { AxiosError } from 'axios';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TOKEN_APP } from "@/lib/constant";

export async function getTokenLogin() {
    const cookieStore =await cookies();
    return cookieStore.get(TOKEN_APP)?.value ?? '';
}

export async function checkLogin() {
    const token = await getTokenLogin();
    if (!token) {
        redirect('/login');
    }
    return true;
}

export async function ProtectedRouter({ redirectPage = '/login' }: { redirectPage: string }) {
    const token = await getTokenLogin();
    if (!token) {
        redirect(redirectPage);
    }
    return true;
}

export async function handleUnauthorized(err: AxiosError) {
    const resErr = err.response!;
    if (resErr.status === 401) {
        redirect('/login');
    }
    return resErr;
}
