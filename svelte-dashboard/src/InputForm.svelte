<script>
import { onMount } from 'svelte';
let moisture = '';
let temp = '';
let light = '';
let notes = '';
let plant_id = '';
let loading = false;
let message = '';
let error = '';

async function submitForm(e) {
	e.preventDefault();
	loading = true;
	message = '';
	error = '';
	try {
		const res = await fetch('http://localhost:5000/api/add_reading', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				moisture: parseFloat(moisture),
				temp: parseFloat(temp),
				light: parseFloat(light),
				notes,
				plant_id: plant_id ? parseInt(plant_id) : null
			})
		});
		if (!res.ok) throw new Error((await res.json()).error || 'Failed to submit');
		message = 'Reading submitted!';
		moisture = temp = light = notes = plant_id = '';
	} catch (e) {
		error = e.message;
	}
	loading = false;
}
</script>

<form class="input-form" on:submit|preventDefault={submitForm}>
	<div class="form-row">
		<label>Soil Moisture (%) <input type="number" min="0" max="100" step="0.1" bind:value={moisture} required /></label>
		<label>Temperature (°C) <input type="number" step="0.1" bind:value={temp} required /></label>
		<label>Light Intensity (Lux) <input type="number" min="0" step="1" bind:value={light} required /></label>
	</div>
	<div class="form-row">
		<label>Notes <input type="text" bind:value={notes} /></label>
		<label>Plant ID <input type="number" min="1" step="1" bind:value={plant_id} /></label>
	</div>
	<button type="submit" disabled={loading}>Submit</button>
	{#if message}
		<p class="success">{message}</p>
	{/if}
	{#if error}
		<p class="error">{error}</p>
	{/if}
</form>

<style>
.input-form {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}
.form-row {
	display: flex;
	gap: 1.5rem;
	flex-wrap: wrap;
}
label {
	display: flex;
	flex-direction: column;
	font-size: 1rem;
	color: #2d3748;
	gap: 0.3rem;
}
input[type="number"], input[type="text"] {
	padding: 0.5rem;
	border: 1px solid #cbd5e1;
	border-radius: 4px;
	font-size: 1rem;
	width: 160px;
}
button[type="submit"] {
	align-self: flex-start;
	padding: 0.6rem 1.5rem;
	background: #2d3748;
	color: #fff;
	border: none;
	border-radius: 4px;
	font-size: 1rem;
	cursor: pointer;
	transition: background 0.2s;
}
button[disabled] {
	background: #a0aec0;
	cursor: not-allowed;
}
.success {
	color: #38a169;
}
.error {
	color: #e53e3e;
}
</style>
