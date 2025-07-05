import { writable } from 'svelte/store';

export const user = writable(null);
export const lastLogin = writable(null);

export async function fetchUserInfo() {
  try {
    const res = await fetch('http://localhost:5000/api/userinfo', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Not logged in');
    const data = await res.json();
    user.set(data.username);
    lastLogin.set(data.last_login);
    return true;
  } catch {
    user.set(null);
    lastLogin.set(null);
    return false;
  }
}
