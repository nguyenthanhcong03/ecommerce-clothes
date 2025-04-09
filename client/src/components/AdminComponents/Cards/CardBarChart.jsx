import React, { useEffect } from 'react';
import Chart from 'chart.js/auto';

export default function CardBarChart() {
  useEffect(() => {
    const ctx = document.getElementById('bar-chart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
          {
            label: new Date().getFullYear(),
            backgroundColor: '#ed64a6',
            borderColor: '#ed64a6',
            data: [30, 78, 56, 34, 100, 45, 13],
            borderWidth: 1,
            barThickness: 8
          },
          {
            label: new Date().getFullYear() - 1,
            backgroundColor: '#4c51bf',
            borderColor: '#4c51bf',
            data: [27, 68, 86, 74, 10, 4, 87],
            borderWidth: 1,
            barThickness: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgba(0,0,0,.4)'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          title: {
            display: false,
            text: 'Orders Chart'
          }
        },
        interaction: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          x: {
            display: false,
            grid: {
              color: 'rgba(33, 37, 41, 0.3)',
              borderDash: [2],
              borderDashOffset: 2
            }
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(33, 37, 41, 0.2)',
              borderDash: [2],
              borderDashOffset: 2
            }
          }
        }
      }
    });

    return () => {
      chart.destroy();
    };
  }, []);

  return (
    <div className='relative mb-6 flex w-full min-w-0 flex-col break-words rounded bg-white shadow-lg'>
      <div className='mb-0 rounded-t bg-transparent px-4 py-3'>
        <div className='flex flex-wrap items-center'>
          <div className='relative w-full max-w-full flex-1 flex-grow'>
            <h6 className='text-blueGray-400 mb-1 text-xs font-semibold uppercase'>Performance</h6>
            <h2 className='text-blueGray-700 text-xl font-semibold'>Total orders</h2>
          </div>
        </div>
      </div>
      <div className='flex-auto p-4'>
        <div className='h-350-px relative'>
          <canvas id='bar-chart'></canvas>
        </div>
      </div>
    </div>
  );
}
