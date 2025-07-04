<script>
import { onMount } from 'svelte';
import Chart from 'chart.js/auto';
let chart;
let chartEl;
let loading = true;
let error = '';
let data = [];
let range = '24h'; // default range

const ranges = [
	{ label: 'Last 24 Hours', value: '24h' },
	{ label: 'Last 7 Days', value: '7d' },
	{ label: 'All', value: 'all' }
];

function getRangeParams() {
	if (range === 'all') return '';
	const now = new Date();
	let from;
	if (range === '24h') {
		from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
	} else if (range === '7d') {
		from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	}
	if (from) {
		return `?from=${from.toISOString().slice(0, 19).replace('T', ' ')}`;
	}
	return '';
}

async function fetchData() {
	loading = true;
	error = '';
	try {
		const res = await fetch(`http://localhost:5000/api/readings${getRangeParams()}`);
		if (!res.ok) throw new Error('Failed to fetch data');
		data = await res.json();
	} catch (e) {
		error = e.message;
		data = [];
	}
	loading = false;
}

function renderChart() {
	if (!chartEl || !data.length) return;
	const labels = data.map(r => r.timestamp);
	const moisture = data.map(r => r.moisture);
	if (chart) chart.destroy();
	chart = new Chart(chartEl, {
		type: 'line',
		data: {
			labels,
			datasets: [{
				label: 'Soil Moisture (%)',
				data: moisture,
				borderColor: '#3182ce',
				backgroundColor: 'rgba(49,130,206,0.1)',
				fill: true,
				pointRadius: 2
			}]
		},
		options: {
			responsive: true,
			scales: {
				y: { beginAtZero: true, max: 100 }
			},
			plugins: {
				legend: { display: true }
			}
		}
	});
}

async function updateChart() {
	await fetchData();
	renderChart();
}

onMount(updateChart);

$: if (!loading && !error) renderChart();
</script>

<div class="chart-controls">
	<label for="range">Show: </label>
	<select id="range" bind:value={range} on:change={updateChart}>
		{#each ranges as r}
			<option value={r.value}>{r.label}</option>
		{/each}
	</select>
	<button on:click={updateChart} disabled={loading}>Refresh</button>
</div>

<div class="chart-container">
	{#if loading}
		<p>Loading chart...</p>
	{:else if error}
		<p class="error">{error}</p>
	{:else}
		<canvas bind:this={chartEl} width="800" height="300"></canvas>
	{/if}
</div>

<style>
.chart-container {
	width: 100%;
	min-height: 320px;
	background: #f8fafc;
	border-radius: 8px;
	padding: 1rem;
	box-sizing: border-box;
}
.chart-controls {
	display: flex;
	align-items: center;
	gap: 1rem;
	margin-bottom: 0.5rem;
}
.error {
	color: #e53e3e;
}
</style>
