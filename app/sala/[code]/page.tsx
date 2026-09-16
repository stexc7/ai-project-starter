import Link from 'next/link';
import { cookies } from 'next/headers';

import { normalizeRoomCode, ROOM_CODE_LENGTH } from '@/domain/codes';
import { buildStateDelta } from '@/domain/sync';
import { readSessionToken, sessionCookieName } from '@/server/auth';
import { getRoomStore } from '@/server/store';
import { AccessForm } from '@/ui/AccessForm';
import { RoomScreen } from '@/ui/RoomScreen';

export const dynamic = 'force-dynamic';

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const code = normalizeRoomCode((await params).code);
  if (code.length !== ROOM_CODE_LENGTH) return <Missing />;

  const room = await getRoomStore().get(code);
  if (!room) return <Missing />;

  const jar = await cookies();
  const session = readSessionToken(jar.get(sessionCookieName(code))?.value, code);
  const member = session && room.members.find((current) => current.id === session.memberId);

  // Sin sesión válida se pide el PIN. La sala nunca llega al navegador aquí.
  if (!session || !member) {
    return (
      <main className="screen" style={{ justifyContent: 'center' }}>
        <AccessForm mode="join" fixedCode={code} />
      </main>
    );
  }

  // Se manda la sala ya pintada desde el servidor: al abrirla no hay parpadeo.
  return (
    <RoomScreen
      code={code}
      meId={session.memberId}
      initial={buildStateDelta(room, { since: 0, serverMs: Date.now(), viewerId: session.memberId })}
    />
  );
}

function Missing() {
  return (
    <main className="screen" style={{ justifyContent: 'center' }}>
      <div className="card stack">
        <h2>Esa sala no existe</h2>
        <p className="muted">
          Puede que el código esté mal escrito o que la sala lleve un mes sin usarse.
        </p>
        <Link className="btn btn--primary" href="/" style={{ textAlign: 'center' }}>
          Volver al principio
        </Link>
      </div>
    </main>
  );
}
