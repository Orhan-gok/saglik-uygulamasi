document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const profileForm = document.getElementById('profile-form');
    const logoutBtn = document.getElementById('logout-btn');
    const authSection = document.getElementById('auth-section');
    const loginRegisterForms = document.getElementById('login-register-forms');
    const profileSection = document.getElementById('profile-section');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profilePhotoInput = document.getElementById('profile-photo-input');
    const profilePhoto = document.getElementById('profile-photo');
    const removePhotoBtn = document.getElementById('remove-photo-btn');
    const defaultPhoto = 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png';
    let profilePhotoUrl = '';

    // Kullanıcı oturum kontrolü
    checkLogin();

    // Kayıt işlemi
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const user = {
            name: document.getElementById('register-name').value,
            surname: document.getElementById('register-surname').value,
            email: document.getElementById('register-email').value,
            username: document.getElementById('register-username').value,
            password: document.getElementById('register-password').value
        };
        // Kullanıcıları localStorage'da sakla
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.username === user.username)) {
            alert('Bu kullanıcı adı zaten alınmış!');
            return;
        }
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        registerForm.reset();
    });

    // Giriş işlemi
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        // localStorage'dan kullanıcıları al
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Debug için kullanıcıları konsola yazdır
        console.log('Kayıtlı kullanıcılar:', users);
        
        // Kullanıcıyı bul
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Giriş başarılı
            localStorage.setItem('loggedInUser', username);
            checkLogin();
            loginForm.reset(); // Formu temizle
        } else {
            // Giriş başarısız
            alert('Kullanıcı adı veya şifre hatalı!');
            console.log('Giriş denemesi:', { username, password });
        }
    });

    // Çıkış işlemi
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('loggedInUser');
            checkLogin();
            // Formları temizle
            loginForm.reset();
            registerForm.reset();
        });
    }

    // Profil bilgilerini kaydet
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const profileData = {
            age: document.getElementById('age').value,
            height: document.getElementById('height').value,
            weight: document.getElementById('weight').value
        };
        const username = localStorage.getItem('loggedInUser');
        // Fotoğraf yüklenmişse onu da kaydet
        if (profilePhotoInput && profilePhotoInput.files && profilePhotoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                localStorage.setItem('profilePhoto_' + username, event.target.result);
                saveProfileData();
            };
            reader.readAsDataURL(profilePhotoInput.files[0]);
        } else {
            saveProfileData();
        }
        function saveProfileData() {
            localStorage.setItem('profileData_' + username, JSON.stringify(profileData));
            alert('Profil bilgileri kaydedildi!');
            updateSummaryCards();
        }
    });

    // Profil fotoğrafı yuvarlağına tıklayınca dosya seçici açılsın
    profilePhoto.addEventListener('click', function() {
        profilePhotoInput.click();
    });

    // Fotoğraf seçilince göster ve kaydet
    profilePhotoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                profilePhoto.src = event.target.result;
                const username = localStorage.getItem('loggedInUser');
                if (username) {
                    localStorage.setItem('profilePhoto_' + username, event.target.result);
                }
                removePhotoBtn.style.display = 'block';
                updateSummaryCards();
            };
            reader.readAsDataURL(file);
        }
    });

    // Fotoğraf kaldır butonu
    removePhotoBtn.addEventListener('click', function() {
        profilePhoto.src = defaultPhoto;
        const username = localStorage.getItem('loggedInUser');
        if (username) {
            localStorage.removeItem('profilePhoto_' + username);
        }
        removePhotoBtn.style.display = 'none';
        updateSummaryCards();
    });

    // Oturum kontrolü ve form gösterimi
    function checkLogin() {
        const username = localStorage.getItem('loggedInUser');
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username);
        if (username && user) {
            loginRegisterForms.style.display = 'none';
            profileSection.style.display = 'block';
            // Profil bilgilerini doldur
            profileName.textContent = user.name + ' ' + user.surname;
            profileEmail.textContent = user.email;
            loadProfileData(username);
            updateSummaryCards();
        } else {
            loginRegisterForms.style.display = 'block';
            profileSection.style.display = 'none';
            document.getElementById('summary-content').innerHTML = '';
        }
    }

    // Profil bilgilerini yükle
    function loadProfileData(username) {
        const savedData = localStorage.getItem('profileData_' + username);
        const savedPhoto = localStorage.getItem('profilePhoto_' + username);
        if (savedData) {
            const profileData = JSON.parse(savedData);
            document.getElementById('age').value = profileData.age;
            document.getElementById('height').value = profileData.height;
            document.getElementById('weight').value = profileData.weight;
        } else {
            document.getElementById('age').value = '';
            document.getElementById('height').value = '';
            document.getElementById('weight').value = '';
        }
        if (savedPhoto) {
            profilePhoto.src = savedPhoto;
            removePhotoBtn.style.display = 'block';
        } else {
            profilePhoto.src = defaultPhoto;
            removePhotoBtn.style.display = 'none';
        }
        updateSummaryCards();
    }

    function updateProfilePhoto() {
        // Profilde fotoğraf alanı yok, summary'de göstermek için kullanılacak
    }

    // Kullanıcıya özel summary kartlarını oluştur
    function updateSummaryCards() {
        const username = localStorage.getItem('loggedInUser');
        const savedData = localStorage.getItem('profileData_' + username);
        const summaryContent = document.getElementById('summary-content');
        if (savedData) {
            const profileData = JSON.parse(savedData);
            let photoHtml = '';
            const savedPhoto = localStorage.getItem('profilePhoto_' + username);
            if (savedPhoto) {
                photoHtml = `<div class='text-center mb-3'><img src='${savedPhoto}' class='rounded-circle' width='80' height='80' alt='Profil Fotoğrafı'></div>`;
            }
            summaryContent.innerHTML = `
                ${photoHtml}
                <div class="row g-3 mb-4">
                    <div class="col-md-4">
                        <div class="card p-3">
                            <h6>Profil</h6>
                            <div>Yaş: <span class="fw-bold">${profileData.age}</span></div>
                            <div>Boy: <span class="fw-bold">${profileData.height} cm</span></div>
                            <div>Kilo: <span class="fw-bold">${profileData.weight} kg</span></div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            summaryContent.innerHTML = '<div class="alert alert-info">Profil bilgilerinizi girerek özetinizi oluşturabilirsiniz.</div>';
        }
    }
}); 