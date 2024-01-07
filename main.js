/* eslint-disable max-len */
'use strict';

const apiKey = '91a81dd3-2e9a-4632-aa35-773a38ebc39e';
const apiUrl = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes';

const itemsPerPage = 10;
let currentPage = 1;

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
/* Загружает маршруты с сервера */
function DownloadData(page = 1, url) {
    const apiURL = `${apiUrl}?api_key=${apiKey}`;
    url = apiURL;
    let i = 1;
    const tableBody = document.getElementById('tableRoutes');
    tableBody.innerHTML = '';

    fetch(url, { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка загрузки маршрутов: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const tasksArray = Array.isArray(data.tasks) ? data.tasks : [];

            data.forEach(route => {
                if (i > (page - 1) * itemsPerPage && i <= page * itemsPerPage) {
                    drawRoutes(route);
                    i++;
                } else {
                    i++;
                }
            });
        })
        .catch(error => {
            showAlert(`Ошибка загрузки маршрутов: ${error.message}`, 'danger');
        });
}
/* Обрабатывает кнопки пагинации и отправляет данные на обновление */
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
        showAlert(`currentPage: ${currentPage}`, 'danger');
        DownloadData(currentPage);
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
    DownloadData(1);
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