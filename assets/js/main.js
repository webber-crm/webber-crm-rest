import "./app.js";
import { functions as func } from "./functions.js";

document.addEventListener('DOMContentLoaded', () => {

    /*
        Обработка гамбургер-меню
     */
    func.burgerMenuHandler()

    /*
        Обработка вкладок (tabs)
     */
    func.tabsWithContent()

    /*
        Выводим заголовок задачи при наведении на ID (страница Оплаты)
     */
    document.querySelectorAll('.payment-table .payment-task').forEach(item => {
        item.addEventListener('mouseover', e => {
            const id = e.target.textContent;
            const td = e.target.parentNode.querySelector('.notification');
            if (td == null) {
                let notify = document.createElement('div');
                notify.className = 'notification payment-notification is-info';
                notify.textContent = "Поменять заголовки";

                e.target.parentNode.appendChild(notify);
            }
        })
    })

    /*
        Удаляем заголовок задачи после наведения на ID (страница Оплаты)
     */
    document.querySelectorAll('.payment-task').forEach(item => {
        item.addEventListener('mouseout', e => {
            const td = e.target.parentNode.querySelector('.notification');

            e.target.parentNode.removeChild(td)
        })
    })

    /*
        Удаляем подсказку (notification) по клику
     */
    document.querySelectorAll('.notification .delete').forEach(item => {
        item.addEventListener('click', e => {

            let notify = e.target.closest('.notification');
            notify.parentNode.removeChild(notify);
        })
    })

    /*
        Форматируем цены с классом .price
     */
    document.querySelectorAll('.price').forEach(item => {
        item.textContent = func.formatPrice(item.textContent)
    })

});