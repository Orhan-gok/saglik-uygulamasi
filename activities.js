document.addEventListener('DOMContentLoaded', function() {
    const activityForm = document.getElementById('activity-form');
    
    activityForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const activityData = {
            type: document.getElementById('activity-type').value,
            duration: parseInt(document.getElementById('duration').value),
            distance: parseFloat(document.getElementById('distance').value),
            date: new Date().toISOString()
        };

        // Mevcut aktiviteleri al
        let activities = JSON.parse(localStorage.getItem('activities') || '[]');
        activities.push(activityData);
        
        // Local storage'a kaydet
        localStorage.setItem('activities', JSON.stringify(activities));
        
        // Grafikleri güncelle
        updateCharts();
        
        alert('Aktivite kaydedildi!');
        activityForm.reset();
    });

    // Sayfa yüklendiğinde grafikleri güncelle
    updateCharts();
});

function updateCharts() {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    
    // Önceki grafikleri temizle
    if (window.weeklyChart) {
        window.weeklyChart.destroy();
    }
    if (window.typesChart) {
        window.typesChart.destroy();
    }
    
    // Haftalık aktivite grafiği
    const weeklyCtx = document.getElementById('weekly-activities-chart').getContext('2d');
    const weeklyData = getWeeklyActivityData(activities);
    
    window.weeklyChart = new Chart(weeklyCtx, {
        type: 'bar',
        data: {
            labels: weeklyData.labels,
            datasets: [{
                label: 'Günlük Aktivite Süresi (dakika)',
                data: weeklyData.data,
                backgroundColor: 'rgba(13, 110, 253, 0.5)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Dakika'
                    }
                }
            }
        }
    });

    // Aktivite türleri grafiği
    const typesCtx = document.getElementById('activity-types-chart').getContext('2d');
    const typesData = getActivityTypesData(activities);
    
    window.typesChart = new Chart(typesCtx, {
        type: 'pie',
        data: {
            labels: typesData.labels,
            datasets: [{
                data: typesData.data,
                backgroundColor: [
                    'rgba(13, 110, 253, 0.5)',
                    'rgba(25, 135, 84, 0.5)',
                    'rgba(255, 193, 7, 0.5)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Aktivite Türleri Dağılımı'
                }
            }
        }
    });
}

function getWeeklyActivityData(activities) {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Günün başlangıcına ayarla
    const weekData = new Array(7).fill(0);
    
    activities.forEach(activity => {
        const activityDate = new Date(activity.date);
        activityDate.setHours(0, 0, 0, 0); // Günün başlangıcına ayarla
        
        const dayDiff = Math.floor((today - activityDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff >= 0 && dayDiff < 7) {
            const dayIndex = (today.getDay() - dayDiff + 7) % 7;
            weekData[dayIndex] += parseInt(activity.duration);
        }
    });
    
    // Günleri bugünden başlayarak sırala
    const reorderedDays = [];
    const reorderedData = [];
    const todayIndex = today.getDay();
    
    for (let i = 0; i < 7; i++) {
        const index = (todayIndex - i + 7) % 7;
        reorderedDays.unshift(days[index]);
        reorderedData.unshift(weekData[index]);
    }
    
    return {
        labels: reorderedDays,
        data: reorderedData
    };
}

function getActivityTypesData(activities) {
    const types = {
        walking: 'Yürüyüş',
        running: 'Koşu',
        cycling: 'Bisiklet'
    };
    
    const typeCounts = {
        walking: 0,
        running: 0,
        cycling: 0
    };
    
    activities.forEach(activity => {
        if (typeCounts.hasOwnProperty(activity.type)) {
            typeCounts[activity.type]++;
        }
    });
    
    return {
        labels: Object.values(types),
        data: Object.values(typeCounts)
    };
} 