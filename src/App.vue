<script setup>
	import StartButton from './components/StartButton.vue'
	import DataProcessor from './components/DataProcessor.vue';
	import lossPlot from './components/d3/lossPlot.vue';
	import classifyPlot from './components/d3/classifyPlot.vue';
	import { ref } from 'vue';

	const resetPlotFlag = ref(false);
</script>

<template>
	<div style="width: 50%; float: left;">
		<!-- <a href="https://vitejs.dev" target="_blank">
			<img src="/vite.svg" class="logo" alt="Vite logo" />
		</a>
		<a href="https://vuejs.org/" target="_blank">
			<img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
		</a> -->
		<StartButton />
		<DataProcessor />
		<!-- <SetUpModel /> -->
		<!-- <FlowGraph /> -->
	</div>
	<div style="width: 50%; float: right;">
		<lossPlot :reset-flag="resetPlotFlag" @resetComplete="resetPlotFlag = false" />
		<classifyPlot :reset-flag="resetPlotFlag" @classifyResetComplete="resetPlotFlag = false" />
	</div>
</template>
<style scoped>
.logo {
	height: 6em;
	padding: 1.5em;
	will-change: filter;
	transition: filter 300ms;
}
.logo:hover {
	filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
	filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
