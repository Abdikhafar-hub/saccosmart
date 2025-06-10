'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Component that uses useSearchParams
function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setMsg('Passwords do not match');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', { token, password });
      setMsg('Password reset successful! You can now log in.');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sacco-blue to-sacco-green p-4">
      <form onSubmit={handleReset} className="bg-white p-6 rounded shadow-lg w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold mb-2">Set New Password</h2>
        <Input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
        {msg && <div className="text-center text-sacco-blue">{msg}</div>}
      </form>
    </div>
  );
}

// Main page component with Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}