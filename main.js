/* eslint-disable max-len */
'use strict';

const apiKey = '91a81dd3-2e9a-4632-aa35-773a38ebc39e';
const apiUrl = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes';

const itemsPerPage = 10;
let currentPage = 1;
let totalPages = 0;
let flag = 0;

let obj = '';
let q = '';
let lang = '';
let ageFrom = 0;
let ageTo = 0;

/* Реализация отображения сообщений */
function showAlert(message, type) {
    const alertsContainer = document.querySelector('.alerts');
    const alertTemplate = document.getElementById('alert-template');
    const alertElement = alertTemplate.content.firstElementChild.cloneNode(true);
    alertElement.classList.add(`alert-${type}`);
    alertElement.querySelector('.msg').textContent = message;
    alertsContainer.appendChild(alertElement);
    setTimeout(() => {
        alertElement.remove();
    }, 5000);
}
/* Подсвечивает строку при выборе 
type: o-route 1-guide*/
function highlightRow(type, id) {
    //убирает подсветку прошлую выбранную строку
    let tableName = '';
    let dataId = '';
    if (type == 0) {
        tableName = 'tableRoutes';
        dataId = 'route';
    } else {
        tableName = 'tableGuides';
        dataId = 'guide';
    }

    const selectedRow = document.getElementById(tableName).querySelector('.selected');
    if (selectedRow) {
        selectedRow.classList.remove('selected');
        const selectedButton = selectedRow.querySelector('.btn');
        if (selectedButton) {
            selectedButton.classList.remove('btn-secondary');
            selectedButton.classList.add('btn-outline-secondary');
        }
    }
    //включает подсветку
    const row = document.querySelector(`[data-${dataId}-id="${id}"]`);
    if (row) {
        row.classList.toggle('selected');
        const button = row.querySelector('.btn');
        if (button) {
            button.classList.toggle('btn-outline-secondary');
            button.classList.toggle('btn-secondary');
        }
    }
}
/* Добавляет маршруты в таблицу */
function drawRoutes(route) {
    const tableBody = document.getElementById('tableRoutes');
    const newRow = document.createElement('tr');
    newRow.dataset.routeId = route.id;
    newRow.innerHTML = `
        <th scope="row" class="routeTitle">${route.name}</th>
        <td>
            <div class="max-h overflow-y-auto">${route.description}</div>
        </td>
        <td>
            <div class="max-h overflow-y-auto">${route.mainObject}</div>
        </td>
        <td><button class="btn btn-outline-secondary">Выбрать</button></td>
    `;
    tableBody.appendChild(newRow);
    const storedRoute = localStorage.getItem('selectedRoute');
    if (storedRoute) {
        const routeData = JSON.parse(storedRoute);
        if (route.id == routeData.id) {
            highlightRow(0, routeData.id);
        }
    }

}
/* Обновляет пагинацию страниц */
function updatePage(pages) {
    const pagination = document.getElementsByClassName('pagination')[0];
    pagination.innerHTML = '';

    // Добавляем элемент "Предыдущая"
    if (currentPage != 1) {
        const prevListItem = document.createElement('li');
        prevListItem.classList.add('page-item');

        const prevLink = document.createElement('a');
        prevLink.classList.add('page-link');
        prevLink.href = '#';
        prevLink.setAttribute('data-page', 'prev');
        prevLink.setAttribute('aria-label', 'Предыдущая');

        const prevSpan = document.createElement('span');
        prevSpan.setAttribute('aria-hidden', 'true');
        prevSpan.textContent = '«';

        prevLink.appendChild(prevSpan);
        prevListItem.appendChild(prevLink);
        pagination.appendChild(prevListItem);
    }

    //отрисовка элементов страниц
    for (let i = 1; i <= pages; i++) {
        const listItem = document.createElement('li');
        listItem.classList.add('page-item');

        const link = document.createElement('a');
        link.classList.add('page-link');
        link.href = '#';
        link.setAttribute('data-page', i.toString());
        link.textContent = i;

        listItem.appendChild(link);
        pagination.appendChild(listItem);
    }

    // Добавляем элемент "Следующая"
    if (currentPage != pages) {
        const nextListItem = document.createElement('li');
        nextListItem.classList.add('page-item');

        const nextLink = document.createElement('a');
        nextLink.classList.add('page-link');
        nextLink.href = '#';
        nextLink.setAttribute('data-page', 'next');
        nextLink.setAttribute('aria-label', 'Следующая');

        const nextSpan = document.createElement('span');
        nextSpan.setAttribute('aria-hidden', 'true');
        nextSpan.textContent = '»';

        nextLink.appendChild(nextSpan);
        nextListItem.appendChild(nextLink);
        pagination.appendChild(nextListItem);
    }

    const pageButtons = document.querySelectorAll('.pagination .page-item a');
    pageButtons.forEach(link => {
        const dataPageValue = link.getAttribute('data-page');
        // Если значение совпадает с currentPage, добавляем класс 'active', иначе убираем класс 'active'
        if (dataPageValue == currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
/* Заполняет список объектов */
function populateLandmarkFilter(data) {
    const uniqueLandmarks = [];

    data.forEach(route => {
        const landmarks = route.mainObject.split('-');
        landmarks.forEach(landmark => {
            if (landmark.trim() !== '' && landmark.trim().length <= 70) {
                if (!uniqueLandmarks.includes(landmark.trim())) {
                    uniqueLandmarks.push(landmark.trim());
                }
            }
        });
    });
    const landmarkSelect = document.getElementById('landmark');
    landmarkSelect.innerHTML = '';

    // Опция "Не выбрано"
    const defaultOption = document.createElement('option');
    defaultOption.text = 'Не выбрано';
    defaultOption.value = '';
    landmarkSelect.add(defaultOption);

    // Заполнение списка
    uniqueLandmarks.forEach(landmark => {
        const option = document.createElement('option');
        option.text = landmark;
        option.value = landmark;
        landmarkSelect.add(option);
    });
}

/* Загружает маршруты с сервера */
function DownloadData(page = 1) {
    const URL = `${apiUrl}?api_key=${apiKey}`;
    let i = 1;
    const tableBody = document.getElementById('tableRoutes');
    tableBody.innerHTML = '';

    fetch(URL, { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка загрузки маршрутов: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {

            data.forEach(route => {
                if ((obj == '' || route.mainObject.includes(obj)) && (q == '' || route.name.includes(q))) {
                    if (i > (page - 1) * itemsPerPage && i <= page * itemsPerPage) {
                        drawRoutes(route);
                    }
                    i++;
                }
            });
            totalPages = Math.ceil(i / itemsPerPage);
            updatePage(totalPages);
            if (!flag) {
                populateLandmarkFilter(data);
            }
            flag = 1;
        })
        .catch(error => {
            showAlert(`Ошибка загрузки маршрутов: ${error.message}`, 'danger');
        });
}
/* Отправляет данные на обновление */
function pageBtnHandler(event) {

    if (event.target.dataset.page) {
        if (event.target.dataset.page == "next" && currentPage < 12) {
            currentPage++;
        } else if (event.target.dataset.page == "prev" && currentPage > 1) {
            currentPage--;
        }
        if (!isNaN(event.target.dataset.page)) {
            currentPage = event.target.dataset.page;
        }
        DownloadData(currentPage);
    }
    updatePage(totalPages);

}
/* Начальная загрузка маршрутов */
window.onload = function () {
    DownloadData(1);
};

/* Обрабочик пагинации */
document.querySelector('.pagination').onclick = pageBtnHandler;
/* Обработчик выбора объекта */
const landmarkSelect = document.getElementById('landmark');
landmarkSelect.addEventListener('change', function () {
    const selectedLandmark = landmarkSelect.value;
    if (selectedLandmark === 'Не выбрано') {
        obj = '';
        DownloadData(1);
    } else {
        obj = selectedLandmark;
        DownloadData(1);
    }
});
/* Обработчик ввода названия маршрута*/
document.getElementById('routeName').addEventListener('input', function (event) {
    const searchQuery = event.target.value.trim();
    if (searchQuery === '') {
        q = '';
        DownloadData(1);
    } else {
        q = searchQuery;
        DownloadData(1);
    }
});

/* Работа с таблицей гидов */
let i = 0;
/* Добавляет гидов в таблицу */
function drawGuides(guide) {
    i = i > 8 ? 1 : i;
    i++;
    const tableBody = document.getElementById('tableGuides');
    const newRow = document.createElement('tr');

    newRow.dataset.guideId = guide.id;

    newRow.innerHTML = `
        <th scope="row"><img class="logo" src="images/avatar${i}.png" alt="Изображение"></th>
        <td class="guideName">${guide.name}</td>
        <td>${guide.language}</td>
        <td>${guide.workExperience}</td>
        <td class="pricePerHour">${guide.pricePerHour}</td>
        <td><button class="btn btn-outline-secondary">Выбрать</button></td>
    `;

    tableBody.appendChild(newRow);
    const storedGuide = localStorage.getItem('selectedGuide');
    if (storedGuide) {
        const guideData = JSON.parse(storedGuide);
        if (guide.id == guideData.id) {
            highlightRow(1, guideData.id);
        }
    }
}
function populateLanguageFilter(data) {
    const uniqueLanguages = [];

    // Предположим, что в каждом объекте route есть поле languages
    data.forEach(guide => {
        const language = guide.language;
        if (language && typeof language === 'string' && language.trim() !== '') {
            if (!uniqueLanguages.includes(language.trim())) {
                uniqueLanguages.push(language.trim());
            }
        }
    });

    const languageSelect = document.getElementById('language');
    languageSelect.innerHTML = '';

    // Опция "Не выбрано"
    const defaultOption = document.createElement('option');
    defaultOption.text = 'Не выбрано';
    defaultOption.value = '';
    languageSelect.add(defaultOption);

    // Заполнение списка
    uniqueLanguages.forEach(language => {
        const option = document.createElement('option');
        option.text = language;
        option.value = language;
        languageSelect.add(option);
    });
}

/* Получение гидов по маршруту */
function GetGuides(idRoute) {
    const Url = `${apiUrl}/${idRoute}/guides?api_key=${apiKey}`;
    const tableBody = document.getElementById('tableGuides');
    tableBody.innerHTML = '';

    fetch(Url, { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка загрузки маршрутов: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {

            data.forEach(guide => {
                if ((lang == '' || guide.language.includes(lang))
                    && (ageFrom === 0 || guide.workExperience > ageFrom)
                    && (ageTo === 0 || guide.workExperience < ageTo)) {
                    drawGuides(guide);
                }
            });
            populateLanguageFilter(data);
        })
        .catch(error => {
            showAlert(`Ошибка загрузки маршрутов: ${error.message}`, 'danger');
        });
}

/* Обработчик выбора маршрута*/
document.getElementById('tableRoutes').addEventListener('click', function (event) {
    const target = event.target;
    if (target.tagName === 'BUTTON' && target.classList.contains('btn-outline-secondary')) {
        const row = target.closest('tr');

        // Сохранение в localStorage
        const routeTitleValue = row.querySelector('.routeTitle').textContent;
        const routeId = row.dataset.routeId;
        localStorage.setItem('selectedRoute', JSON.stringify({ id: routeId, name: routeTitleValue }));
        //Подсветка выбранной строки
        highlightRow(0, routeId);
        //Отображение таблицы
        const hiddenSection = document.querySelector('.d-none');
        if (hiddenSection) {
            hiddenSection.classList.remove('d-none');
        }
        //Добавление названия маршрута
        const routeTitle = document.getElementById('routeTitle');
        routeTitle.textContent = `Доступные гиды по маршруту ${routeTitleValue}`;
        GetGuides(routeId);
        //Добавление данных в форму
        document.getElementById('selectedRoute').value = routeTitleValue;

    }
});
/* Обработчик выбора гида*/
document.getElementById('tableGuides').addEventListener('click', function (event) {
    const target = event.target;
    if (target.tagName === 'BUTTON' && target.classList.contains('btn-outline-secondary')) {
        const row = target.closest('tr');
        // Сохранение в localStorage
        const guideNameValue = row.querySelector('.guideName').textContent;
        const GuideId = row.dataset.guideId;
        const guidePriceValue = row.querySelector('.pricePerHour').textContent;
        localStorage.setItem('selectedGuide', JSON.stringify({ id: GuideId, name: guideNameValue, pricePerHour: guidePriceValue }));
        //Подсветка выбранной строки
        highlightRow(1, GuideId);
        //Отображение кнопки заявки
        const hiddenSection = document.querySelector('.d-none');
        if (hiddenSection) {
            hiddenSection.classList.remove('d-none');
            hiddenSection.classList.add('d-flex');
        }
        //Добавление данных в форму
        document.getElementById('selectedGuide').value = guideNameValue;
    }
});

const languageSelect = document.getElementById('language');
languageSelect.addEventListener('change', function () {
    const selectedLanguage = languageSelect.value;
    const storedRoute = localStorage.getItem('selectedRoute');
    if (storedRoute) {
        const routeData = JSON.parse(storedRoute);

        if (selectedLanguage === 'Не выбрано') {
            lang = '';
            GetGuides(routeData.id);
        } else {
            lang = selectedLanguage;
            GetGuides(routeData.id);
        }
    }
});

const experienceFromInput = document.getElementById('ageFrom');
const experienceToInput = document.getElementById('ageTo');

// Обработчик для поля "от"
experienceFromInput.addEventListener('input', function () {
    const experienceFromValue = experienceFromInput.value;
    const storedRoute = localStorage.getItem('selectedRoute');
    if (storedRoute) {
        const routeData = JSON.parse(storedRoute);
        if (experienceFromValue == '') {
            ageFrom = 0;
            GetGuides(routeData.id);
        } else {
            ageFrom = experienceFromValue;
            GetGuides(routeData.id);
        }
    }
});

// Обработчик для поля "до"
experienceToInput.addEventListener('input', function () {
    const experienceToValue = experienceToInput.value;
    const storedRoute = localStorage.getItem('selectedRoute');
    if (storedRoute) {
        const routeData = JSON.parse(storedRoute);
        if (experienceToValue == '') {
            ageTo = 0;
            GetGuides(routeData.id);

        } else {
            ageTo = experienceToValue;
            GetGuides(routeData.id);
        }
    }
});

// Получение элементов формы
const excursionDateInput = document.getElementById('excursionDate');
const startTimeInput = document.getElementById('startTime');
const durationSelect = document.getElementById('duration');
const groupSizeInput = document.getElementById('groupSize');
const option1Checkbox = document.getElementById('option1');
const option2Checkbox = document.getElementById('option2');
const totalCostInput = document.getElementById('totalCost');

function calculate () {
    // Получение значений из формы
    const excursionDate = new Date(excursionDateInput.value);
    const startTime = startTimeInput.value;
    const duration = parseFloat(durationSelect.value);
    const groupSize = parseInt(groupSizeInput.value);
    const isOption1Selected = option1Checkbox.checked;
    const isOption2Selected = option2Checkbox.checked;
    let guideServiceCost;
    // Получение дня недели
    const dayOfWeek = excursionDate.getDay();
    const storedGuide = localStorage.getItem('selectedGuide');
    if (storedGuide) {
        const Data = JSON.parse(storedGuide);
        guideServiceCost = Data.pricePerHour;
    }

    const hoursNumber = duration;
    const isThisDayOff = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.5 : 1;
    const isItMorning = (startTime >= '09:00' && startTime < '12:00') ? 400 : 0;
    const isItEvening = (startTime >= '20:00' && startTime < '23:00') ? 1000 : 0;
    let numberOfVisitorsCost;
    if (groupSize >= 1 && groupSize <= 5) {
        numberOfVisitorsCost = 0;
    } else if (groupSize <= 10) {
        numberOfVisitorsCost = 1000;
    } else if (groupSize <= 20) {
        numberOfVisitorsCost = 1500;
    } else {
        numberOfVisitorsCost = 0;
    }

    let totalCost = guideServiceCost * hoursNumber * isThisDayOff + isItMorning + isItEvening + numberOfVisitorsCost;
    if (isOption1Selected) {
        totalCost = totalCost * 0.85;
    }
    if (isOption2Selected) {
        totalCost = totalCost + 500;
    }
    // Отображение результата в поле "Итоговая стоимость"
    if (startTime < '09:00' || startTime > '23:00') {
        showAlert(`Время начала экскурсии доступно с 9 до 23`, 'danger');
    } else if (groupSize < 1 || groupSize > 20) {
        showAlert(`Количество человек в группе варьируется от 1 до 20`, 'danger');
    } else {
        totalCostInput.value = totalCost.toFixed(2);
    }
}

excursionDateInput.addEventListener('change', calculate);
startTimeInput.addEventListener('change', calculate);
durationSelect.addEventListener('change', calculate);
groupSizeInput.addEventListener('input', calculate);
option1Checkbox.addEventListener('change', calculate);
option2Checkbox.addEventListener('change', calculate);