const fs = require('fs');
const path = require('path');

const func = {
    /*
        функция загрузки файла из формы в файловую систему
        возвращем путь до загруженной фотографии

        принимается параметр img - картинка из формы
     */
    async uploadUserImage(img) {
        const uploads = path.join(__dirname, '..', '..', 'assets', 'uploads');
        const images = path.join(__dirname, '..', '..', 'assets', 'uploads', 'images');

        fs.stat(uploads, err => {
            if (err) {
                if (err.code === 'ENOENT') {
                    fs.mkdir(uploads, err => {
                        // путь, callback
                        if (err) throw new Error(err); // вывод ошибки
                    });
                } else {
                    throw Error(err);
                }
            }
        });

        fs.stat(images, err => {
            if (err) {
                if (err.code === 'ENOENT') {
                    fs.mkdir(images, err => {
                        // путь, callback
                        if (err) throw new Error(err); // вывод ошибки
                    });
                } else {
                    throw Error(err);
                }
            }
        });

        // создание файла fs.writeFile()
        const uploadPath = path.join(images, img.name);
        const imagePath = path.join('uploads', 'images', img.name);

        await img.mv(uploadPath, err => {
            if (err) throw new Error(err);
        });

        return `/${imagePath}`;
    },

    /*
        получаем JSON из строки

        принимается 1 параметр str - строка с JSON-данными
     */
    getJSONDataFromString(str) {
        try {
            str = JSON.parse(str);
        } catch (e) {
            str = [str];
        }

        return str;
    },

    /*
        форматируем дату
        преобразование из типа данных Date в строку

        принимается 1 параметр date - данные в формате Date

        возвращается объект с 2 свойствами:
        ru - DD.MM.YYYY (для вывода на страницу)
        en - YYYY-MM-DD (как правило, для input[type="date"])
     */
    getFormattedDate(date) {
        return { ru: date.toLocaleDateString('ru-RU'), en: date.toISOString().substring(0, 10) };
    },

    /*
        получаем форматированный объект для данных, которые выводим в списке select
        суть форматирования заключается в том, что в объект добавляется свойство selected (true/false)

        принимается 2 параметра:
        1 data - исходный массив
        2 field - поле, которое из этого списка является "выбранным", и для него нужно добавить свойство selected: true

        параметр field может быть id или массивом, который содержит ID в виде ObjectID
     */
    getFilteredSelectList(data, field) {
        if (Array.isArray(field)) {
            return data.map(obj => (field.includes(obj._id)
                ? { ...obj.toObject(), selected: true }
                : { ...obj.toObject(), selected: false }));
        }
        return field
            ? data.map(obj => (obj._id.toString() === field._id.toString()
                ? { ...obj.toObject(), selected: true }
                : { ...obj.toObject(), selected: false }))
            : data;
    },

    /*
        получаем форматированный объект для данных, которые выводим в списке select
        суть форматирования заключается в том, что в объект добавляется свойство selected (true/false)

        принимается 2 параметра:
        1 model - модель Mongoose (через неё получаем общий список данных в коллекции)
        2 field - поле, которое из этого списка является "выбранным", и для него нужно добавить свойство selected: true

        по свойству field происходит проверка основного объекта, полученного из БД
     */
    async getFilteredSelectListFromDB(model, field) {
        const data = await model.find();
        return field
            ? data.map(obj => (obj._id.toString() === field._id.toString()
                ? { ...obj.toObject(), selected: true }
                : { ...obj.toObject(), selected: false }))
            : data;
    },

    /*
        принимается 2 параметра:
        1 model - модель Mongoose (через неё получаем общий список данных в коллекции)
        2 field - поле, которое из этого списка является выбранным, и для него нужно добавить свойство selected: true

        по свойству field происходит проверка основного объектов в массиве, полученного из БД
        в массиве check проверяется наличие ID текущего элемента
     */
    async getFilteredArrayFromDB(model, field, check = null) {
        const data = await model.find();
        return data.filter(
            item => item._id.toString() !== field._id.toString()
                && (check !== null ? check.includes(item._id.toString()) : true),
        );
    },
};

module.exports = func;
