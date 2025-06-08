// Sayfa yönlendirme işlemleri
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // Aktif sayfayı değiştir
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === `${targetPage}-page`) {
                    page.classList.add('active');
                }
            });

            // Aktif nav link'i güncelle
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Sidebar linkleri
    const summaryLink = document.getElementById('summary-link');
    const healthCategoriesList = document.getElementById('health-categories-list');
    const mainContentSection = document.getElementById('main-content-section');
    const summaryContent = document.getElementById('summary-content');
    const categoryContent = document.getElementById('category-content');

    // Summary'yi göster
    function showSummary() {
        summaryContent.style.display = 'block';
        categoryContent.style.display = 'none';
        // Sadece kullanıcıya özel summary kartları profile.js tarafından doldurulacak
        // Burada elle bir şey ekleme
    }

    // Health Category detaylarını göster
    function showCategory(category) {
        summaryContent.style.display = 'none';
        categoryContent.style.display = 'block';
        // Her kategori için kullanıcıdan veri girişi alınabilecek bir form ve girilen verilerin listesi
        let title = '';
        let fields = [];
        switch(category) {
            case 'activity':
                title = 'Activity';
                fields = [
                    {id: 'activity-type', label: 'Aktivite Türü', type: 'text'},
                    {id: 'activity-duration', label: 'Süre (dakika)', type: 'number'},
                    {id: 'activity-distance', label: 'Mesafe (km)', type: 'number'}
                ]; break;
            case 'hearing':
                title = 'Hearing';
                fields = [
                    {id: 'hearing-level', label: 'Duyma Seviyesi (dB)', type: 'number'}
                ]; break;
            case 'heart':
                title = 'Heart';
                fields = [
                    {id: 'heart-rate', label: 'Nabız (BPM)', type: 'number'}
                ]; break;
            default:
                title = title = category.charAt(0).toUpperCase() + category.slice(1);
                fields = [
                    {id: category+'-note', label: title+' Notu', type: 'text'}
                ]; break;
        }
        let formHtml = `<form id="category-form" class="mb-3">`;
        fields.forEach(f => {
            formHtml += `<div class="mb-2"><label class="form-label">${f.label}</label><input type="${f.type}" class="form-control" id="${f.id}" required></div>`;
        });
        formHtml += `<button type="submit" class="btn btn-primary">Kaydet</button></form>`;
        formHtml += `<div id="category-data-list"></div>`;
        categoryContent.innerHTML = `<div class="card p-4"><h4>${title}</h4>${formHtml}</div>`;

        // Form submit işlemi
        const form = document.getElementById('category-form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = localStorage.getItem('loggedInUser');
            if (!username) return;
            let data = JSON.parse(localStorage.getItem('categoryData_'+category+'_'+username) || '[]');
            const entry = {};
            fields.forEach(f => {
                entry[f.id] = document.getElementById(f.id).value;
            });
            entry.date = new Date().toLocaleString();
            data.push(entry);
            localStorage.setItem('categoryData_'+category+'_'+username, JSON.stringify(data));
            form.reset();
            renderCategoryDataList();
        });
        function renderCategoryDataList() {
            const username = localStorage.getItem('loggedInUser');
            let data = JSON.parse(localStorage.getItem('categoryData_'+category+'_'+username) || '[]');
            let html = '';
            if (data.length === 0) {
                html = '<div class="alert alert-info">Henüz veri girilmedi.</div>';
            } else {
                html = '<ul class="list-group">'+data.map(entry =>
                    `<li class="list-group-item">${fields.map(f => `<b>${f.label}:</b> ${entry[f.id]}`).join(' | ')} <span class='text-muted float-end'>${entry.date}</span></li>`
                ).join('')+'</ul>';
            }
            document.getElementById('category-data-list').innerHTML = html;
        }
        renderCategoryDataList();
    }

    // Summary linkine tıklanınca
    summaryLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSummary();
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });

    // Health categories linklerine tıklanınca
    healthCategoriesList.querySelectorAll('a[data-category]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            showCategory(category);
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Sayfa ilk açıldığında summary göster
    showSummary();
}); 