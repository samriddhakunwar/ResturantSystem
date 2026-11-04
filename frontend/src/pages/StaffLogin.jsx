// ─── Staff Login ──────────────────────────────────────────────────────────────
// /staff/login — username + password → DRF token (stored by api/client).
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import SectionPanel from '../components/ui/SectionPanel';
import TextField from '../components/ui/TextField';
import { ApiError } from '../api/client';
import { authApi } from '../api/staff';

export default function StaffLogin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const next = params.get('next');
  const target = next && next.startsWith('/staff') && next !== '/staff/login' ? next : '/staff';

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await authApi.login(username, password);
      navigate(target, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? 'That username and password don’t match.'
          : err instanceof ApiError && err.status === 429
            ? 'Too many tries. Please wait a minute.'
            : 'We can’t reach the café system right now.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-4 py-16 text-charcoal">
      <div className="mx-auto max-w-[400px]">
        <SectionPanel title="Staff sign in" cat="walking" catClassName="right-[12%] h-[72px]">
          <form onSubmit={submit} className="space-y-4 text-left">
            <TextField label="Username" autoComplete="username" required value={username}
              onChange={(e) => setUsername(e.target.value)} />
            <TextField label="Password" type="password" autoComplete="current-password" required value={password}
              onChange={(e) => setPassword(e.target.value)} />
            <div aria-live="assertive">{error && <p className="wb-field-error m-0">{error}</p>}</div>
            <Button type="submit" block disabled={sending}>{sending ? 'Signing in…' : 'Sign in'}</Button>
          </form>
        </SectionPanel>
      </div>
    </div>
  );
}
