<script>
	// No props needed for main dashboard layout
</script>

<main class="dashboard-container">
	<header class="dashboard-header">
		<h1>Resource-Efficient Plant Care Dashboard</h1>
	</header>
	<section class="dashboard-main">
		<!-- Placeholder for current plant status, charts, and input form -->
		<div class="status-section">
			<h2>Current Plant Status</h2>
			<!-- Add status cards/components here in later steps -->
		</div>
		<div class="charts-section">
			<h2>Historical Data</h2>
			<!-- Chart.js integration will go here -->
		</div>
		<div class="input-section">
			<h2>Manual Input</h2>
			<!-- Manual input form will go here -->
		</div>
	</section>
</main>

<style>
.dashboard-container {
	font-family: system-ui, sans-serif;
	background: #f8fafc;
	min-height: 100vh;
}
.dashboard-header {
	background: #2d3748;
	color: #fff;
	padding: 2rem 0 1rem 0;
	text-align: center;
	box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.dashboard-header h1 {
	margin: 0;
	font-size: 2.2rem;
	font-weight: 700;
	letter-spacing: 1px;
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
	background: #fff;
	border-radius: 8px;
	box-shadow: 0 1px 4px rgba(0,0,0,0.06);
	padding: 1.5rem;
}
.status-section h2, .charts-section h2, .input-section h2 {
	margin-top: 0;
	color: #2d3748;
	font-size: 1.3rem;
}
</style>