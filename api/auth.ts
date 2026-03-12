import { removePushToken } from '@/utils/notifications';
import { supabase } from '@/utils/supabase';

export interface AuthError {
  message: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  fullName: string;
}

export async function login({ email, password }: LoginParams): Promise<AuthError | null> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? { message: error.message } : null;
}

export async function register({ email, password, fullName }: RegisterParams): Promise<AuthError | null> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName.trim() },
    },
  });
  return error ? { message: error.message } : null;
}

export async function logout(): Promise<AuthError | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await removePushToken(user.id);

  const { error } = await supabase.auth.signOut();
  return error ? { message: error.message } : null;
}

export async function refreshSession(): Promise<AuthError | null> {
  const { error } = await supabase.auth.refreshSession();
  return error ? { message: error.message } : null;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function resetPassword(email: string): Promise<AuthError | null> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return error ? { message: error.message } : null;
}
