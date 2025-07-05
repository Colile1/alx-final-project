<script>
import { onMount } from 'svelte';
let loading = true;
let error = '';
let data = null;
let prediction = null;
let predLoading = false;
let predError = '';

// Thresholds (could be made configurable later)
const MOISTURE_DRY = 40;
const MOISTURE_WET = 85;
const TEMP_MAX = 30;
const LIGHT_MIN = 500;

function getStatus() {
	if (!data) return null;
	if (data.moisture !== undefined && data.moisture < MOISTURE_DRY) {
		return { msg: 'Needs water!', type: 'alert', icon: '💧' };
	}
	if (data.moisture !== undefined && data.moisture > MOISTURE_WET) {
		return { msg: 'Soil too wet', type: 'warn', icon: '🌧️' };
	}
	if (data.temp !== undefined && data.temp > TEMP_MAX) {
		return { msg: 'Too hot!', type: 'warn', icon: '🌡️' };
	}
	if (data.light !== undefined && data.light < LIGHT_MIN) {
		return { msg: 'Needs more light', type: 'warn', icon: '💡' };
	}
	return { msg: 'Plant is healthy', type: 'ok', icon: '🌱' };
}

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

async function fetchPrediction() {
	predLoading = true;
	predError = '';
	try {
		const res = await fetch('http://localhost:5000/api/predict_next_watering');
		if (!res.ok) throw new Error('Prediction error');
		prediction = await res.json();
	} catch (e) {
		predError = e.message;
		prediction = null;
	}
	predLoading = false;
}

onMount(() => {
	fetchLatest();
	fetchPrediction();
	const interval = setInterval(() => {
		fetchLatest();
		fetchPrediction();
	}, 5000); // refresh every 5s
	return () => clearInterval(interval);
});
</script>

<div class="current-status">
	{#if loading}
		<p>Loading latest plant data...</p>
	{:else if error}
		<p class="error">{error}</p>
	{:else if data}
		{#if getStatus()}
			<div class="status {getStatus().type}">
				<span class="icon">{getStatus().icon}</span>
				<span>{getStatus().msg}</span>
			</div>
		{/if}
		{#if predLoading}
			<p>Predicting next watering...</p>
		{:else if predError}
			<p class="error">{predError}</p>
		{:else if prediction && prediction.prediction}
			<div class="prediction">
				<span class="icon">⏳</span>
				<span>Next watering estimated: <b>{prediction.prediction}</b> ({prediction.hours_to_threshold} hours left)</span>
			</div>
		{:else if prediction && prediction.message}
			<div class="prediction warn">{prediction.message}</div>
		{/if}
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
.status {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 1.2rem;
	margin-bottom: 1rem;
	padding: 0.5rem 1rem;
	border-radius: 6px;
	font-weight: 500;
}
.status.alert {
	background: #fff5f5;
	color: #e53e3e;
	border: 1px solid #e53e3e33;
}
.status.warn {
	background: #fefcbf;
	color: #b7791f;
	border: 1px solid #b7791f33;
}
.status.ok {
	background: #f0fff4;
	color: #38a169;
	border: 1px solid #38a16933;
}
.status .icon {
	font-size: 1.5rem;
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
.prediction {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	background: #e6fffa;
	color: #285e61;
	border: 1px solid #81e6d9;
	border-radius: 6px;
	padding: 0.5rem 1rem;
	margin-bottom: 1rem;
	font-size: 1.1rem;
}
.prediction.warn {
	background: #fefcbf;
	color: #b7791f;
	border: 1px solid #b7791f33;
}
</style>
