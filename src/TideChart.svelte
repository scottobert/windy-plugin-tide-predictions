<div class="tide-chart-container">
    {#if loading}
        <div class="centered">Loading chart data...</div>
    {:else if error}
        <div class="error-message size-xs">{error}</div>
    {:else if chartData.length > 0}
        <svg bind:this={svgEl} class="tide-chart"></svg>
    {:else}
        <div class="centered size-xs">No chart data available</div>
    {/if}
</div>

<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import * as d3 from 'd3';
    
    export let stationId: string;
    export let stationName: string;

    interface TideChartPoint {
        time: Date;
        height: number;
        isHighLow?: boolean;
        type?: 'H' | 'L';
    }

    let svgEl: SVGSVGElement;
    let chartData: TideChartPoint[] = [];
    let loading = false;
    let error = '';

    const fetchChartData = async () => {
        if (!stationId) return;
        
        loading = true;
        error = '';
        chartData = [];

        try {
            const today = new Date();
            const endDate = new Date(today);
            endDate.setDate(endDate.getDate() + 3);

            const beginDate = today.toISOString().split('T')[0].replace(/-/g, '');
            const end = endDate.toISOString().split('T')[0].replace(/-/g, '');

            // Fetch hourly predictions for the chart line
            const hourlyUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
                `product=predictions&application=NOS.COOPS.TAC.WL&` +
                `begin_date=${beginDate}&end_date=${end}&` +
                `datum=MLLW&station=${stationId}&time_zone=lst_ldt&` +
                `units=english&interval=h&format=json`;

            // Fetch high/low predictions for markers
            const hiloUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
                `product=predictions&application=NOS.COOPS.TAC.WL&` +
                `begin_date=${beginDate}&end_date=${end}&` +
                `datum=MLLW&station=${stationId}&time_zone=lst_ldt&` +
                `units=english&interval=hilo&format=json`;

            const [hourlyResponse, hiloResponse] = await Promise.all([
                fetch(hourlyUrl),
                fetch(hiloUrl)
            ]);

            const hourlyData = await hourlyResponse.json();
            const hiloData = await hiloResponse.json();

            if (hourlyData.predictions && hiloData.predictions) {
                // Create map of high/low times for quick lookup
                const hiloMap = new Map();
                hiloData.predictions.forEach((p: any) => {
                    hiloMap.set(p.t, p.type);
                });

                // Build chart data with all hourly points
                chartData = hourlyData.predictions.map((p: any) => {
                    const time = new Date(p.t);
                    const height = parseFloat(p.v);
                    const hiloType = hiloMap.get(p.t);
                    
                    return {
                        time,
                        height,
                        isHighLow: !!hiloType,
                        type: hiloType
                    };
                });

                // Draw the chart after data is loaded
                if (svgEl) {
                    drawChart();
                }
            } else {
                error = 'No chart data available for this station';
            }
        } catch (err) {
            console.error('Error fetching chart data:', err);
            error = 'Failed to load chart data';
        } finally {
            loading = false;
        }
    };

    const drawChart = () => {
        if (!svgEl || chartData.length === 0) return;

        // Clear existing chart
        d3.select(svgEl).selectAll('*').remove();

        const margin = { top: 20, right: 20, bottom: 40, left: 50 };
        const width = svgEl.clientWidth - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        const svg = d3.select(svgEl);

        const g = svg
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Create scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(chartData, d => d.time) as [Date, Date])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([
                d3.min(chartData, d => d.height) as number - 1,
                d3.max(chartData, d => d.height) as number + 1
            ])
            .range([height, 0]);

        // Create axes
        const xAxis = d3.axisBottom(xScale)
            .ticks(6)
            .tickFormat(d3.timeFormat('%a %H:%M') as any);

        const yAxis = d3.axisLeft(yScale)
            .ticks(5);

        // Add grid lines
        g.append('g')
            .attr('class', 'grid')
            .attr('opacity', 0.1)
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat(() => '')
            );

        // Draw the line
        const line = d3.line<TideChartPoint>()
            .x(d => xScale(d.time))
            .y(d => yScale(d.height))
            .curve(d3.curveMonotoneX);

        // Add gradient for area under curve
        const gradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', 'tide-gradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#36a2eb')
            .attr('stop-opacity', 0.5);

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#36a2eb')
            .attr('stop-opacity', 0.1);

        // Add area under the curve
        const area = d3.area<TideChartPoint>()
            .x(d => xScale(d.time))
            .y0(height)
            .y1(d => yScale(d.height))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(chartData)
            .attr('class', 'tide-area')
            .attr('d', area)
            .attr('fill', 'url(#tide-gradient)');

        // Draw the tide line
        g.append('path')
            .datum(chartData)
            .attr('class', 'tide-line')
            .attr('fill', 'none')
            .attr('stroke', '#36a2eb')
            .attr('stroke-width', 2)
            .attr('d', line);

        // Add high/low markers
        const highLowPoints = chartData.filter(d => d.isHighLow);

        g.selectAll('.tide-marker')
            .data(highLowPoints)
            .enter()
            .append('circle')
            .attr('class', 'tide-marker')
            .attr('cx', d => xScale(d.time))
            .attr('cy', d => yScale(d.height))
            .attr('r', 4)
            .attr('fill', d => d.type === 'H' ? '#ff9500' : '#4ecdc4')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5);

        // Add labels for high/low points
        g.selectAll('.tide-label')
            .data(highLowPoints)
            .enter()
            .append('text')
            .attr('class', 'tide-label')
            .attr('x', d => xScale(d.time))
            .attr('y', d => yScale(d.height) - 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', d => d.type === 'H' ? '#ff9500' : '#4ecdc4')
            .text(d => d.height.toFixed(1));

        // Add x-axis
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis)
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        // Add y-axis
        g.append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        // Add y-axis label
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -40)
            .attr('x', -height / 2)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', 'rgba(255, 255, 255, 0.8)')
            .text('Height (ft)');
    };

    $: if (stationId) {
        fetchChartData();
    }

    onMount(() => {
        if (stationId) {
            fetchChartData();
        }
    });

    afterUpdate(() => {
        if (svgEl && chartData.length > 0) {
            drawChart();
        }
    });
</script>

<style lang="less">
    .tide-chart-container {
        margin-top: 15px;
        margin-bottom: 20px;
    }

    .tide-chart {
        width: 100%;
        height: 200px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
    }

    .centered {
        text-align: center;
        padding: 20px;
        color: rgba(255, 255, 255, 0.6);
    }

    .error-message {
        color: #ff6b6b;
        text-align: center;
        padding: 10px;
    }

    :global(.x-axis text),
    :global(.y-axis text) {
        fill: rgba(255, 255, 255, 0.8);
        font-size: 10px;
    }

    :global(.x-axis line),
    :global(.y-axis line),
    :global(.x-axis path),
    :global(.y-axis path) {
        stroke: rgba(255, 255, 255, 0.3);
    }

    :global(.grid line) {
        stroke: rgba(255, 255, 255, 0.1);
    }
</style>
