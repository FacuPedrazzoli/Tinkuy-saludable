import { NextRequest } from 'next/server';
import { graphql } from 'graphql';
import { schema } from '@/graphql/schema';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@/modules/auth/service';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, variables } = body;

    const authHeader = request.headers.get('authorization');
    let userId: string | undefined;
    let userRole: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      if (payload) {
        userId = payload.userId;
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });
        userRole = user?.role;
      }
    }

    const sessionId = request.cookies.get('session_id')?.value;

    const result = await graphql({
      schema,
      source: query,
      variableValues: variables,
      contextValue: {
        userId,
        sessionId,
        prisma,
        user: userId ? { id: userId, role: userRole } : null,
      },
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('GraphQL Error:', error);
    return new Response(
      JSON.stringify({
        errors: [
          {
            message: error instanceof Error ? error.message : 'Internal server error',
          },
        ],
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'GraphQL endpoint. Use POST with query and variables.',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
