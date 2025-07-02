<script>
import { onMount } from 'svelte';
let loading = true;
let error = '';
let data = null;

async function fetchLatest() {
	loading = true;
	error = '';
	try {
		const res = await fetch('http://localhost:5000/api/latest_reading');
		if (!res.ok) throw new Error('No data found');
		data = await res.json();
	} catch (e) {
		error = e.message;
		data = null;
	}
	loading = false;
}

onMount(() => {
	fetchLatest();
	const interval = setInterval(fetchLatest, 5000); // refresh every 5s
	return () => clearInterval(interval);
});
</script>

<div class="current-status">
	{#if loading}
		<p>Loading latest plant data...</p>
	{:else if error}
		<p class="error">{error}</p>
	{:else if data}
		<div class="metrics">
			<div class="metric">
				<span class="label">Soil Moisture</span>
				<span class="value">{data.moisture ?? '-'}%</span>
			</div>
			<div class="metric">
				<span class="label">Temperature</span>
				<span class="value">{data.temp ?? '-'}°C</span>
			</div>
			<div class="metric">
				<span class="label">Light Intensity</span>
				<span class="value">{data.light ?? '-'} Lux</span>
			</div>
			<div class="metric">
				<span class="label">Last Updated</span>
				<span class="value">{data.timestamp ?? '-'}</span>
			</div>
		</div>
	{/if}
</div>

<style>
.current-status {
	padding: 1rem 0;
}
.metrics {
	display: flex;
	flex-wrap: wrap;
	gap: 2rem;
	justify-content: space-between;
}
.metric {
	background: #f1f5f9;
	border-radius: 8px;
	padding: 1rem 2rem;
	min-width: 160px;
	text-align: center;
	box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.label {
	display: block;
	color: #64748b;
	font-size: 1rem;
	margin-bottom: 0.5rem;
}
.value {
	font-size: 1.5rem;
	font-weight: bold;
	color: #2d3748;
}
.error {
	color: #e53e3e;
}
</style>
