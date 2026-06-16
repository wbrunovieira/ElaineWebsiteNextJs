'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Não foi possível entrar.');
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-7 rounded-3xl border border-black/[0.06] bg-white/70 p-8 shadow-[0_12px_48px_rgba(43,45,66,0.12)] backdrop-blur-sm sm:p-10"
      >
        <div className="space-y-2 text-center">
          <h1 className="font-playfair text-3xl font-bold text-primary sm:text-4xl">
            Área da Elaine
          </h1>
          <p className="font-lato text-base text-foreground/60">
            Entre para atualizar o site
          </p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-lato text-base font-semibold text-foreground/80">
              E-mail
            </span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-base text-foreground transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-lato text-base font-semibold text-foreground/80">
              Senha
            </span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-white/70 px-4 py-3 pr-12 text-base text-foreground transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                aria-label={
                  showPassword ? 'Ocultar senha' : 'Mostrar senha'
                }
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-muted hover:text-primary"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </label>
        </div>

        {error && (
          <p
            className="rounded-xl bg-primary/10 px-4 py-3 font-lato text-base font-medium text-primary"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3.5 font-lato text-lg font-semibold text-background shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
