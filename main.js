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
/* Добавляет маршруты в таблицу */
function drawRoutes(route) {
    const tableBody = document.getElementById('tableRoutes');
    const newRow = document.createElement('tr');
    newRow.id = `route-${route.id}`;
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
    const apiURL = `${apiUrl}?api_key=${apiKey}`;
    let i = 1;
    const tableBody = document.getElementById('tableRoutes');
    tableBody.innerHTML = '';

    fetch(apiURL, { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка загрузки маршрутов: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const tasksArray = Array.isArray(data.tasks) ? data.tasks : [];

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
/* Подсвечивает строку при выборе и добавляет название к гидам */
function highlightRow(button) {
    //убирает подсветку прошлую выбранную строку
    const selectedRow = document.querySelector('.selected');
    if (selectedRow) {
        selectedRow.classList.remove('selected');
        const selectedButton = selectedRow.querySelector('.btn');
        selectedButton.classList.remove('btn-secondary');
        selectedButton.classList.add('btn-outline-secondary');
    }
    //включает подсветку
    const row = button.closest('tr');
    row.classList.toggle('selected');
    button.classList.toggle('btn-outline-secondary');
    button.classList.toggle('btn-secondary');
    // Получает значение из выбранной строки
    const routeTitleValue = row.querySelector('.routeTitle').textContent;
    const routeTitle = document.getElementById('routeTitle');
    routeTitle.textContent = `Доступные гиды по маршруту ${routeTitleValue}`;

}

/* Начальная загрузка маршрутов */
window.onload = function () {
    DownloadData();
};
/* Обрабочик пагинации */
document.querySelector('.pagination').onclick = pageBtnHandler;
/* Обработчик выбора маршрута*/
document.getElementById('tableRoutes').addEventListener('click', function (event) {
    const target = event.target;
    if (target.tagName === 'BUTTON' && target.classList.contains('btn-outline-secondary')) {
        highlightRow(target);
        //функция получения списка гидов
    }
});
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
document.getElementById('routeName').addEventListener('input', function(event) {
    const searchQuery = event.target.value.trim();
    if (searchQuery === '') {
        q = '';
        DownloadData(1);
    } else {
        q = searchQuery;
        DownloadData(1);
    }
});
