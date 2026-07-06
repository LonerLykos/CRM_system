import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? '';

const XLSX_CONTENT_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 120_000;
const MAX_POLL_ATTEMPTS = Math.ceil(POLL_TIMEOUT_MS / POLL_INTERVAL_MS);

interface ExportTaskStatus {
    task_id: string;
    state: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE';
    ready: boolean;
    progress?: { processed: number; total: number };
    download_name?: string;
    error?: string;
}

const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

const errorResponse = (message: string, status: number): NextResponse =>
    new NextResponse(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

async function streamFile(backendResponse: Response): Promise<NextResponse> {
    const data = await backendResponse.arrayBuffer();
    const contentType = backendResponse.headers.get('Content-Type') ?? XLSX_CONTENT_TYPE;
    const contentDisposition =
        backendResponse.headers.get('Content-Disposition') ?? 'attachment; filename="orders.xlsx"';

    return new NextResponse(data, {
        status: 200,
        headers: {
            'Content-Type': contentType,
            'Content-Disposition': contentDisposition,
        },
    });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    const search = request.nextUrl.search;

    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join('; ');

    const fetchInit: RequestInit = {
        method: 'GET',
        headers: {
            Cookie: cookieHeader,
            Accept: XLSX_CONTENT_TYPE,
        },
        cache: 'no-store',
    };

    const initial = await fetch(`${INTERNAL_API_URL}/orders/export${search}`, fetchInit);

    const contentType = initial.headers.get('Content-Type') ?? '';
    const isJson = contentType.includes('application/json');

    if (initial.status === 200 && !isJson) {
        return streamFile(initial);
    }

    if (initial.status !== 202) {
        return errorResponse('Export failed', initial.status >= 400 ? initial.status : 502);
    }

    let taskId: string;
    try {
        const body = (await initial.json()) as { task_id?: string };
        if (!body.task_id) {
            return errorResponse('Export failed: missing task id', 502);
        }
        taskId = body.task_id;
    } catch {
        return errorResponse('Export failed: invalid task response', 502);
    }

    const statusUrl = `${INTERNAL_API_URL}/orders/export/${taskId}`;

    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        await delay(POLL_INTERVAL_MS);

        const statusResponse = await fetch(statusUrl, fetchInit);
        if (!statusResponse.ok) {
            return errorResponse('Export status check failed', 502);
        }

        const status = (await statusResponse.json()) as ExportTaskStatus;

        if (status.state === 'FAILURE') {
            return errorResponse(status.error ?? 'Export task failed', 502);
        }

        if (status.ready === true || status.state === 'SUCCESS') {
            const downloadResponse = await fetch(`${statusUrl}/download`, fetchInit);
            if (!downloadResponse.ok) {
                return errorResponse('Export download failed', 502);
            }
            return streamFile(downloadResponse);
        }
    }

   return errorResponse('Export timed out', 504);
}
