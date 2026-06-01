import { NextRequest } from 'next/server';
import { prisma } from './prisma';

export type AgentAuthResult =
  | { ok: true; agentId: string }
  | { ok: false; status: 401; error: string };

/**
 * 에이전트 API 키 검증
 * Header: X-Agent-Key: <api_key>
 *
 * 향후 Agent 테이블에 api_key 컬럼 추가 예정.
 * 현재는 환경변수 AGENT_API_KEY를 master key로 사용 (단일 에이전트 MVP).
 */
export async function verifyAgentKey(req: NextRequest): Promise<AgentAuthResult> {
  const key = req.headers.get('X-Agent-Key');
  if (!key) {
    return { ok: false, status: 401, error: 'missing_agent_key' };
  }

  const masterKey = process.env.AGENT_API_KEY;
  if (!masterKey) {
    return { ok: false, status: 401, error: 'agent_key_not_configured' };
  }

  if (key !== masterKey) {
    return { ok: false, status: 401, error: 'invalid_agent_key' };
  }

  // MVP: 단일 에이전트. agent_id는 환경변수로 관리.
  const agentId = process.env.AGENT_ID ?? '';
  if (!agentId) {
    return { ok: false, status: 401, error: 'agent_id_not_configured' };
  }

  // DB에 에이전트 존재 여부 확인
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { id: true },
  });

  if (!agent) {
    return { ok: false, status: 401, error: 'agent_not_found' };
  }

  return { ok: true, agentId: agent.id };
}
