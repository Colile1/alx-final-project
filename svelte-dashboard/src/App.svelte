<script>
	import { onMount } from 'svelte';
	import Auth from './Auth.svelte';
	import CurrentStatus from './CurrentStatus.svelte';
	import InputForm from './InputForm.svelte';
	import ChartComponent from './ChartComponent.svelte';
	import { user, lastLogin, fetchUserInfo } from './authStore.js';
	import './theme.css';
	let authed = false;
	let checked = false;
	let lastLoginVal = null;
	let theme = localStorage.getItem('theme') || 'light';

	onMount(async () => {
	  authed = await fetchUserInfo();
	  checked = true;
	  $: lastLogin.subscribe(val => lastLoginVal = val);
	  document.documentElement.setAttribute('data-theme', theme);
	});

	function handleLogout() {
	  fetch('http://localhost:5000/api/logout', { method: 'POST', credentials: 'include' })
	    .then(() => { window.location.reload(); });
	}

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}
</script>

<main class="dashboard-container">
	<header class="dashboard-header">
		<h1>Resource-Efficient Plant Care Dashboard</h1>
		<button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle dark/light mode">
			{theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
		</button>
		{#if authed}
			<div class="user-bar">
				<span>Welcome, {$user}!</span>
				{#if lastLoginVal}
					<span class="last-login">Last login: {lastLoginVal}</span>
				{/if}
				<button on:click={handleLogout}>Logout</button>
			</div>
		{/if}
	</header>
	{#if !checked}
		<p style="text-align:center;">Checking authentication...</p>
	{:else if !authed}
		<Auth />
	{:else}
		<section class="dashboard-main">
			<!-- Current Plant Status -->
			<div class="status-section">
				<h2>Current Plant Status</h2>
				<CurrentStatus />
			</div>
			<div class="charts-section">
				<h2>Historical Data</h2>
				<ChartComponent />
			</div>
			<div class="input-section">
				<h2>Manual Input</h2>
				<InputForm />
			</div>
		</section>
	{/if}
</main>

<style>
@import './theme.css';
.dashboard-container {
	font-family: system-ui, sans-serif;
	background: var(--color-bg);
	min-height: 100vh;
}
.dashboard-header {
	background: var(--color-header);
	color: var(--color-header-text);
	padding: 2rem 0 1rem 0;
	text-align: center;
	box-shadow: 0 2px 8px rgba(0,0,0,0.04);
	position: relative;
}
.theme-toggle {
	position: absolute;
	top: 1.2rem;
	right: 2rem;
	background: none;
	border: none;
	font-size: 1.1rem;
	cursor: pointer;
	color: var(--color-header-text);
}
.user-bar {
	display: flex;
	gap: 1.5rem;
	align-items: center;
	justify-content: center;
	margin-top: 0.5rem;
}
.user-bar button {
	background: var(--color-btn);
	color: var(--color-btn-text);
	border: none;
	border-radius: 4px;
	padding: 0.3rem 1rem;
	cursor: pointer;
}
.last-login {
	font-size: 0.95rem;
	color: var(--color-last-login);
}
.dashboard-main {
	display: flex;
	flex-direction: column;
	gap: 2rem;
	max-width: 900px;
	margin: 2rem auto;
	padding: 0 1rem;
}
.status-section, .charts-section, .input-section {
	background: var(--color-card);
	border-radius: 8px;
	box-shadow: 0 1px 4px rgba(0,0,0,0.06);
	padding: 1.5rem;
}
.status-section h2, .charts-section h2, .input-section h2 {
	margin-top: 0;
	color: var(--color-card-title);
	font-size: 1.3rem;
}
</style>