<script>
import { onMount } from 'svelte';
let username = '';
let password = '';
let isLogin = true;
let error = '';
let loading = false;

function switchMode() {
  isLogin = !isLogin;
  error = '';
}

async function handleSubmit() {
  loading = true;
  error = '';
  const endpoint = isLogin ? '/api/login' : '/api/register';
  try {
    const res = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Unknown error');
    // Store login state (could use a store or localStorage if needed)
    window.location.reload(); // reload to show dashboard
  } catch (e) {
    error = e.message;
  }
  loading = false;
}
</script>

<div class="auth-container">
  <h2>{isLogin ? 'Login' : 'Register'}</h2>
  <form on:submit|preventDefault={handleSubmit}>
    <label>
      Username
      <input type="text" bind:value={username} required autocomplete="username" />
    </label>
    <label>
      Password
      <input type="password" bind:value={password} required autocomplete={isLogin ? 'current-password' : 'new-password'} />
    </label>
    {#if error}
      <div class="error">{error}</div>
    {/if}
    <button type="submit" disabled={loading}>{isLogin ? 'Login' : 'Register'}</button>
  </form>
  <button class="switch" on:click={switchMode} disabled={loading}>
    {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
  </button>
</div>

<style>
.auth-container {
  max-width: 350px;
  margin: 3rem auto;
  background: #f8fafc;
  border-radius: 8px;
  padding: 2rem 2.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  text-align: center;
}
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  font-size: 1rem;
}
button {
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  background: #3182ce;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}
button.switch {
  background: none;
  color: #3182ce;
  margin-top: 0.5rem;
  text-decoration: underline;
}
.error {
  color: #e53e3e;
  margin-top: 0.5rem;
}
</style>
