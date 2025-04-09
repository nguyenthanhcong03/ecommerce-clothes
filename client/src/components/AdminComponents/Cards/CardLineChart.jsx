import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function CardLineChart() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');

    const config = {
      type: 'line',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
          {
            label: new Date().getFullYear(),
            backgroundColor: '#4c51bf',
            borderColor: '#4c51bf',
            data: [65, 78, 66, 44, 56, 67, 75],
            fill: false
          },
          {
            label: new Date().getFullYear() - 1,
            fill: false,
            backgroundColor: '#fff',
            borderColor: '#fff',
            data: [40, 68, 86, 74, 56, 60, 87]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: 'white'
            },
            align: 'end',
            position: 'bottom'
          },
          title: {
            display: false,
            text: 'Sales Charts',
            color: 'white'
          }
        },
        scales: {
          x: {
            ticks: {
              color: 'rgba(255,255,255,.7)'
            },
            grid: {
              display: false,
              color: 'rgba(33, 37, 41, 0.3)'
            }
          },
          y: {
            ticks: {
              color: 'rgba(255,255,255,.7)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.15)'
            }
          }
        }
      }
    };

    chartInstanceRef.current = new Chart(ctx, config);

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, []);
  return (
    <>
      <div className='bg-blueGray-700 relative mb-6 flex w-full min-w-0 flex-col break-words rounded shadow-lg'>
        <div className='mb-0 rounded-t bg-transparent px-4 py-3'>
          <div className='flex flex-wrap items-center'>
            <div className='relative w-full max-w-full flex-1 flex-grow'>
              <h6 className='text-blueGray-100 mb-1 text-xs font-semibold uppercase'>Overview</h6>
              <h2 className='text-xl font-semibold text-white'>Sales value</h2>
            </div>
          </div>
        </div>
        <div className='flex-auto p-4'>
          {/* Chart */}
          <div className='h-350-px relative'>
            <canvas id='line-chart'></canvas>
          </div>
        </div>
      </div>
    </>
  );
}
